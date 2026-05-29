const { getStore } = require("@netlify/blobs");
const { randomUUID } = require("crypto");

const STORE_NAME = "daily-question-data";
const DATA_KEY = "state";

const defaultCategories = [
  { id: "cat-frontend", name: "前端", created_at: "2026-05-28T10:00:00.000Z", created_by: "Ming" },
  { id: "cat-system", name: "系统设计", created_at: "2026-05-27T10:00:00.000Z", created_by: "Jia" },
  { id: "cat-basic", name: "计算机基础", created_at: "2026-05-26T10:00:00.000Z", created_by: "Lan" }
];

const defaultQuestions = [
  {
    id: "q-1",
    title: "为什么 React 列表渲染时需要稳定的 key？",
    body: "请从 diff 过程、组件状态复用、列表重排三个角度解释。再说明使用数组下标作为 key 会在哪些场景里出问题。",
    category_id: "cat-frontend",
    category_name: "前端",
    tags: ["React", "渲染", "状态"],
    uploader_name: "Ming",
    uploaded_at: "2026-05-29T08:30:00.000Z",
    source_url: "",
    answer: "稳定 key 让框架能在新旧子节点之间建立可靠映射。列表插入、删除或重排时，如果 key 跟随业务实体而不是位置变化，React 就能复用正确的 DOM 和组件实例。数组下标作为 key 在纯追加列表里通常问题不大，但在中间插入、筛选、排序时会让旧状态错配到新数据上。",
    answer_author: "Jia",
    answered_at: "2026-05-29T09:00:00.000Z"
  },
  {
    id: "q-2",
    title: "如何设计一个支持热点文章排行榜的缓存方案？",
    body: "假设读取量很高，写入量中等，要求榜单尽量实时，但允许数秒延迟。请说明缓存结构、更新策略和降级方案。",
    category_id: "cat-system",
    category_name: "系统设计",
    tags: ["缓存", "排行榜"],
    uploader_name: "Lan",
    uploaded_at: "2026-05-28T08:30:00.000Z",
    source_url: "",
    answer: null,
    answer_author: null,
    answered_at: null
  }
];

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      if (event.queryStringParameters?.debug === "1") {
        return json({
          hasBlobsSiteID: Boolean(process.env.BLOBS_SITE_ID),
          hasBlobsAPIToken: Boolean(process.env.BLOBS_API_TOKEN),
          hasNetlifySiteID: Boolean(process.env.NETLIFY_SITE_ID),
          hasNetlifyAPIToken: Boolean(process.env.NETLIFY_API_TOKEN),
          context: process.env.CONTEXT || null
        });
      }
      return json(await readState());
    }

    const payload = JSON.parse(event.body || "{}");
    assertInvite(payload);

    if (event.httpMethod === "POST") {
      return json(await createQuestion(payload));
    }
    if (event.httpMethod === "PATCH") {
      return json(await updateQuestion(payload));
    }
    if (event.httpMethod === "PUT") {
      return json(await answerQuestion(payload));
    }

    return json({ message: "Method not allowed" }, 405);
  } catch (error) {
    return json({ message: error.message || "请求失败" }, error.statusCode || 400);
  }
};

async function readState() {
  const store = getDataStore();
  const data = await store.get(DATA_KEY, { type: "json" });
  if (data) return normalizeState(data);

  const initial = normalizeState({
    categories: defaultCategories,
    questions: defaultQuestions
  });
  await store.setJSON(DATA_KEY, initial);
  return initial;
}

async function writeState(state) {
  const normalized = normalizeState(state);
  await getDataStore().setJSON(DATA_KEY, normalized);
  return normalized;
}

function getDataStore() {
  if (process.env.BLOBS_SITE_ID && process.env.BLOBS_API_TOKEN) {
    return getStore({
      name: STORE_NAME,
      siteID: process.env.BLOBS_SITE_ID,
      token: process.env.BLOBS_API_TOKEN
    });
  }
  return getStore(STORE_NAME);
}

function normalizeState(state) {
  const categories = Array.isArray(state.categories) ? state.categories : [];
  const questions = Array.isArray(state.questions) ? state.questions : [];
  return {
    categories: categories.sort((a, b) => a.name.localeCompare(b.name, "zh-CN")),
    questions: questions.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
  };
}

async function createQuestion(payload) {
  const state = await readState();
  const category = upsertCategory(state, payload.category_name, payload.uploader_name);
  const now = new Date().toISOString();
  const answer = clean(payload.answer);
  const question = {
    id: randomUUID(),
    title: requireText(payload.title, "题目不能为空"),
    body: requireText(payload.body, "题目不能为空"),
    category_id: category.id,
    category_name: category.name,
    tags: parseTags(payload.tags),
    uploader_name: requireText(payload.uploader_name, "昵称不能为空"),
    uploaded_at: now,
    source_url: clean(payload.source_url),
    answer: answer || null,
    answer_author: answer ? clean(payload.uploader_name) : null,
    answered_at: answer ? now : null
  };

  state.questions.unshift(question);
  await writeState(state);
  return question;
}

async function updateQuestion(payload) {
  const state = await readState();
  const question = state.questions.find((item) => item.id === payload.question_id);
  if (!question) throw statusError("题目不存在", 404);

  const category = upsertCategory(state, payload.category_name, payload.editor_name);
  const answer = clean(payload.answer);
  question.title = requireText(payload.title, "题目不能为空");
  question.body = requireText(payload.body, "题目不能为空");
  question.category_id = category.id;
  question.category_name = category.name;
  question.tags = parseTags(payload.tags);
  question.source_url = clean(payload.source_url);
  question.answer = answer || null;
  question.answer_author = answer ? requireText(payload.editor_name, "编辑者昵称不能为空") : null;
  question.answered_at = answer ? new Date().toISOString() : null;

  await writeState(state);
  return question;
}

async function answerQuestion(payload) {
  const state = await readState();
  const question = state.questions.find((item) => item.id === payload.question_id);
  if (!question) throw statusError("题目不存在", 404);
  if (question.answer) throw statusError("这道题已经有答案了", 409);

  question.answer = requireText(payload.answer, "答案不能为空");
  question.answer_author = requireText(payload.answer_author, "昵称不能为空");
  question.answered_at = new Date().toISOString();

  await writeState(state);
  return question;
}

function upsertCategory(state, name, author) {
  const cleanName = requireText(name, "分类不能为空");
  let category = state.categories.find((item) => item.name === cleanName);
  if (category) return category;

  category = {
    id: randomUUID(),
    name: cleanName,
    created_at: new Date().toISOString(),
    created_by: clean(author) || "匿名"
  };
  state.categories.push(category);
  return category;
}

function assertInvite(payload) {
  const expectedToken = process.env.INVITE_TOKEN || "team-2026";
  const expectedPasscode = process.env.INVITE_PASSCODE || "daily-question";
  if (payload.invite_token !== expectedToken || payload.passcode !== expectedPasscode) {
    throw statusError("邀请链接或口令无效", 401);
  }
}

function parseTags(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).slice(0, 8);
  return String(value || "")
    .split(/[,，\s]+/)
    .map(clean)
    .filter(Boolean)
    .slice(0, 8);
}

function clean(value) {
  return String(value || "").trim();
}

function requireText(value, message) {
  const text = clean(value);
  if (!text) throw statusError(message, 400);
  return text;
}

function statusError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}
