const app = document.querySelector("#app");
const uploadLink = document.querySelector("#uploadLink");
const isFilePreview = window.location.protocol === "file:";

const state = {
  categories: [],
  questions: []
};

const api = {
  enabled: !isFilePreview,
  async request(path, options = {}) {
    if (!this.enabled) {
      return demoRequest(path, options);
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(data?.message || data?.hint || "请求失败");
    }
    return data;
  },
  getQuestions() {
    return this.request("/api/questions").then((data) => data.questions);
  },
  getCategories() {
    return this.request("/api/questions").then((data) => data.categories);
  },
  createQuestion(payload) {
    return this.request("/api/questions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  answerQuestion(payload) {
    return this.request("/api/questions", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  updateQuestion(payload) {
    return this.request("/api/questions", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }
};

const demoData = {
  categories: [
    { id: "cat-frontend", name: "前端", created_at: "2026-05-28T10:00:00Z", created_by: "Ming" },
    { id: "cat-system", name: "系统设计", created_at: "2026-05-27T10:00:00Z", created_by: "Jia" },
    { id: "cat-basic", name: "计算机基础", created_at: "2026-05-26T10:00:00Z", created_by: "Lan" }
  ],
  questions: [
    {
      id: "q-1",
      title: "为什么 React 列表渲染时需要稳定的 key？",
      body: "请从 diff 过程、组件状态复用、列表重排三个角度解释。再说明使用数组下标作为 key 会在哪些场景里出问题。",
      category_id: "cat-frontend",
      category_name: "前端",
      tags: ["React", "渲染", "状态"],
      uploader_name: "Ming",
      uploaded_at: "2026-05-29T08:30:00Z",
      source_url: "",
      answer: "稳定 key 让框架能在新旧子节点之间建立可靠映射。列表插入、删除或重排时，如果 key 跟随业务实体而不是位置变化，React 就能复用正确的 DOM 和组件实例。数组下标作为 key 在纯追加列表里通常问题不大，但在中间插入、筛选、排序时会让旧状态错配到新数据上。",
      answer_author: "Jia",
      answered_at: "2026-05-29T09:00:00Z"
    },
    {
      id: "q-2",
      title: "如何设计一个支持热点文章排行榜的缓存方案？",
      body: "假设读取量很高，写入量中等，要求榜单尽量实时，但允许数秒延迟。请说明缓存结构、更新策略和降级方案。",
      category_id: "cat-system",
      category_name: "系统设计",
      tags: ["缓存", "排行榜"],
      uploader_name: "Lan",
      uploaded_at: "2026-05-28T08:30:00Z",
      source_url: "",
      answer: null,
      answer_author: null,
      answered_at: null
    }
  ]
};

async function demoRequest(path, options = {}) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (path.startsWith("/api/questions") && (!options.method || options.method === "GET")) {
    return demoData;
  }
  if (path.startsWith("/api/questions") && options.method === "POST") {
    const payload = JSON.parse(options.body);
    const categoryName = payload.category_name || "未分类";
    let category = demoData.categories.find((item) => item.name === categoryName);
    if (!category) {
      category = {
        id: crypto.randomUUID(),
        name: categoryName,
        created_at: new Date().toISOString(),
        created_by: payload.uploader_name
      };
      demoData.categories.push(category);
    }
    const question = {
      id: crypto.randomUUID(),
      title: payload.title,
      body: payload.body,
      category_id: category.id,
      category_name: category.name,
      tags: parseTags(payload.tags),
      uploader_name: payload.uploader_name,
      uploaded_at: new Date().toISOString(),
      source_url: payload.source_url || "",
      answer: payload.answer || null,
      answer_author: payload.answer ? payload.uploader_name : null,
      answered_at: payload.answer ? new Date().toISOString() : null
    };
    demoData.questions.unshift(question);
    return [question];
  }
  if (path.startsWith("/api/questions") && options.method === "PUT") {
    const payload = JSON.parse(options.body);
    const question = demoData.questions.find((item) => item.id === payload.question_id);
    if (!question || question.answer) throw new Error("题目不存在或已有答案");
    question.answer = payload.answer;
    question.answer_author = payload.answer_author;
    question.answered_at = new Date().toISOString();
    return [question];
  }
  if (path.startsWith("/api/questions") && options.method === "PATCH") {
    const payload = JSON.parse(options.body);
    const question = demoData.questions.find((item) => item.id === payload.question_id);
    if (!question) throw new Error("题目不存在");
    const categoryName = payload.category_name || "未分类";
    let category = demoData.categories.find((item) => item.name === categoryName);
    if (!category) {
      category = {
        id: crypto.randomUUID(),
        name: categoryName,
        created_at: new Date().toISOString(),
        created_by: payload.editor_name
      };
      demoData.categories.push(category);
    }
    question.title = payload.title;
    question.body = payload.body;
    question.category_id = category.id;
    question.category_name = category.name;
    question.tags = parseTags(payload.tags);
    question.source_url = payload.source_url || "";
    question.answer = payload.answer || null;
    question.answer_author = payload.answer ? payload.editor_name : null;
    question.answered_at = payload.answer ? new Date().toISOString() : null;
    return [question];
  }
  return [];
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function parseTags(value = "") {
  if (Array.isArray(value)) return value;
  return value
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function firstQuestionLine(value = "") {
  const firstLine = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) || "";
  const normalized = firstLine.replace(/\s+/g, " ").trim();
  return normalized.length > 80 ? `${normalized.slice(0, 80)}...` : normalized;
}

function questionBodyHtml(question) {
  const body = (question.body || "").trim();
  const title = (question.title || "").trim();
  if (!body || body === title) return "";
  return `<div class="question-body">${escapeHtml(body)}</div>`;
}

function questionExcerpt(question) {
  const text = (question.body || question.title || "").trim();
  return `${text.slice(0, 150)}${text.length > 150 ? "..." : ""}`;
}

function tagsText(tags = []) {
  return parseTags(tags).join(", ");
}

function storeInvite(invite) {
  if (invite) window.localStorage.setItem("daily-question-invite", invite);
}

function getInviteToken() {
  const search = new URLSearchParams(window.location.search);
  const fromSearch = search.get("invite");
  if (fromSearch) {
    storeInvite(fromSearch);
    return fromSearch;
  }
  return window.localStorage.getItem("daily-question-invite") || "";
}

function setActiveNav() {
  const route = location.hash || "#/";
  document.querySelectorAll(".top-nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === route);
  });
  const token = getInviteToken();
  uploadLink.href = token ? `#/upload?invite=${encodeURIComponent(token)}` : "#/upload";
}

async function loadData() {
  app.innerHTML = document.querySelector("#loadingTemplate").innerHTML;
  const [categories, questions] = await Promise.all([api.getCategories(), api.getQuestions()]);
  state.categories = categories || [];
  state.questions = questions || [];
}

function renderTags(tags = []) {
  return parseTags(tags).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
}

function questionMeta(question) {
  return `
    <div class="meta-row">
      <span class="category-chip">${escapeHtml(question.category_name || "未分类")}</span>
      <span>${formatDate(question.uploaded_at)}</span>
      <span>由 ${escapeHtml(question.uploader_name || "匿名")} 上传</span>
      ${question.source_url ? `<a href="${escapeHtml(question.source_url)}" target="_blank" rel="noreferrer">来源链接</a>` : ""}
      <span class="answer-badge">${question.answer ? "已有答案" : "等待答案"}</span>
    </div>
  `;
}

function questionCard(question) {
  return `
    <a class="list-card" href="#/question/${question.id}">
      <div class="tag-row">
        <span class="category-chip">${escapeHtml(question.category_name || "未分类")}</span>
        <span class="answer-badge">${question.answer ? "已有答案" : "待补答案"}</span>
      </div>
      <h3>${escapeHtml(question.title)}</h3>
      <p>${escapeHtml(questionExcerpt(question))}</p>
      <div class="meta-row">
        <span>${formatDate(question.uploaded_at)}</span>
        <span>${escapeHtml(question.uploader_name || "匿名")}</span>
      </div>
      <div class="tag-row">${renderTags(question.tags)}</div>
    </a>
  `;
}

function renderCategoryNav(activeId = "") {
  const items = state.categories.map((category) => {
    const count = state.questions.filter((question) => question.category_id === category.id).length;
    return `
      <a class="category-link" href="#/category/${category.id}" aria-current="${activeId === category.id ? "page" : "false"}">
        <span>${escapeHtml(category.name)}</span>
        <span>${count}</span>
      </a>
    `;
  }).join("");

  return `
    <aside class="side-panel">
      <div class="side-title">Categories</div>
      <div class="category-list">
        <a class="category-link" href="#/categories"><span>全部题目</span><span>${state.questions.length}</span></a>
        ${items || `<p class="empty-note">还没有分类。</p>`}
      </div>
    </aside>
  `;
}

function renderHome() {
  const latest = state.questions[0];
  if (!latest) {
    app.innerHTML = `
      <section class="state-panel">
        <p class="eyebrow">Daily Question</p>
        <h1>还没有题目</h1>
        <p class="form-note">拿到邀请链接后，可以从上传入口提交第一道面试题。</p>
      </section>
    `;
    return;
  }

  const recent = state.questions.slice(1, 5).map(questionCard).join("");
  app.innerHTML = `
    <section class="hero-grid">
      <article class="question-feature">
        <p class="eyebrow">Today's Question</p>
        <h1>${escapeHtml(latest.title)}</h1>
        ${questionMeta(latest)}
        ${questionBodyHtml(latest)}
        <div class="tag-row">${renderTags(latest.tags)}</div>
        <div class="action-row" style="margin-top: 24px;">
          ${latest.answer ? `<button class="primary-button" data-toggle-answer>查看答案</button>` : `<a class="primary-button" href="#/answer/${latest.id}">补充答案</a>`}
          <a class="ghost-button" href="#/question/${latest.id}">打开详情</a>
          <a class="ghost-button" href="#/edit/${latest.id}">编辑题目</a>
        </div>
        ${renderAnswerPanel(latest)}
      </article>
      ${renderCategoryNav(latest.category_id)}
    </section>
    <section>
      <div class="section-head">
        <div>
          <p class="eyebrow">Archive</p>
          <h2>最近收录</h2>
        </div>
        <a class="pill-button" href="#/categories">查看全部</a>
      </div>
      <div class="question-list">${recent || `<p class="empty-note">暂时只有今天这一题。</p>`}</div>
    </section>
  `;
}

function renderAnswerPanel(question) {
  if (!question.answer) {
    return `<p class="form-note">还没有答案，受邀者可以补充。</p>`;
  }
  return `
    <section class="answer-panel" data-answer-panel>
      <p class="eyebrow">Answer</p>
      <div class="answer-body">${escapeHtml(question.answer)}</div>
      <div class="meta-row">
        <span>由 ${escapeHtml(question.answer_author || "匿名")} 补充</span>
        ${question.answered_at ? `<span>${formatDate(question.answered_at)}</span>` : ""}
      </div>
    </section>
  `;
}

function renderCategories(categoryId = "") {
  const selected = categoryId
    ? state.categories.find((category) => category.id === categoryId)
    : null;
  const list = categoryId
    ? state.questions.filter((question) => question.category_id === categoryId)
    : state.questions;

  app.innerHTML = `
    <section class="hero-grid">
      <div>
        <div class="section-head" style="margin-top: 0;">
          <div>
            <p class="eyebrow">Library</p>
            <h2>${selected ? escapeHtml(selected.name) : "全部题目"}</h2>
            <p>${selected ? "这个分类下的每日题目。" : "按分类和标签慢慢积累起来的面试题库。"}</p>
          </div>
        </div>
        <div class="question-list">${list.map(questionCard).join("") || `<p class="empty-note">这个分类还没有题目。</p>`}</div>
      </div>
      ${renderCategoryNav(categoryId)}
    </section>
  `;
}

function renderQuestion(id) {
  const question = state.questions.find((item) => item.id === id);
  if (!question) {
    renderNotFound();
    return;
  }
  app.innerHTML = `
    <article class="question-feature">
      <p class="eyebrow">Question</p>
      <h1>${escapeHtml(question.title)}</h1>
      ${questionMeta(question)}
      ${questionBodyHtml(question)}
      <div class="tag-row">${renderTags(question.tags)}</div>
      <div class="action-row" style="margin-top: 24px;">
        ${question.answer ? `<button class="primary-button" data-toggle-answer>查看答案</button>` : `<a class="primary-button" href="#/answer/${question.id}">补充答案</a>`}
        <a class="ghost-button" href="#/edit/${question.id}">编辑题目</a>
        <a class="ghost-button" href="#/categories">返回题库</a>
      </div>
      ${renderAnswerPanel(question)}
    </article>
  `;
}

function categoryOptions() {
  return state.categories
    .map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`)
    .join("");
}

function renderEditForm(id) {
  const question = state.questions.find((item) => item.id === id);
  if (!question) {
    renderNotFound();
    return;
  }
  const invite = getInviteToken();
  const canSubmit = api.enabled ? Boolean(invite) : true;
  app.innerHTML = `
    <section class="form-panel">
      <p class="eyebrow">Edit</p>
      <h2>编辑题目</h2>
      ${api.enabled && !invite ? `<p class="form-note">编辑需要邀请链接。请使用带 invite 参数的链接进入。</p>` : ""}
      ${api.enabled ? "" : `<p class="form-note">当前是本地演示模式，修改会立即展示，但刷新页面后不会保存。</p>`}
      <form class="form-grid" id="editQuestionForm">
        <input type="hidden" name="invite_token" value="${escapeHtml(invite)}" />
        <input type="hidden" name="question_id" value="${escapeHtml(question.id)}" />
        <div class="field-grid">
          <label>编辑者昵称<input name="editor_name" required maxlength="40" placeholder="谁修改的" /></label>
          ${api.enabled ? `<label>口令<input name="passcode" type="password" required placeholder="邀请口令" /></label>` : `<input type="hidden" name="passcode" value="" />`}
        </div>
        <label>题目<textarea name="question_text" required>${escapeHtml(question.body || question.title)}</textarea></label>
        <div class="field-grid">
          <label>主分类
            <input name="category_name" list="categoryList" required value="${escapeHtml(question.category_name || "")}" placeholder="选择或输入新分类" />
            <datalist id="categoryList">${categoryOptions()}</datalist>
          </label>
          <label>标签<input name="tags" value="${escapeHtml(tagsText(question.tags))}" placeholder="React, 缓存, 系统设计" /></label>
        </div>
        <label>来源链接<input name="source_url" type="url" value="${escapeHtml(question.source_url || "")}" placeholder="可选" /></label>
        <label>答案<textarea name="answer" placeholder="可选">${escapeHtml(question.answer || "")}</textarea></label>
        <div class="action-row">
          <button class="primary-button" type="submit" ${canSubmit ? "" : "disabled"}>保存修改</button>
          <a class="ghost-button" href="#/question/${question.id}">取消</a>
          <span class="status-text" data-status></span>
        </div>
      </form>
    </section>
  `;
}

function renderUpload() {
  const invite = getInviteToken();
  const canSubmit = api.enabled ? Boolean(invite) : true;
  app.innerHTML = `
    <section class="form-panel">
      <p class="eyebrow">Submit</p>
      <h2>上传一道好题</h2>
      ${api.enabled && !invite ? `<p class="form-note">当前没有检测到邀请链接。请使用带 invite 参数的链接进入，例如 <code>?invite=你的token</code>。</p>` : ""}
      ${api.enabled ? "" : `<p class="form-note">当前是本地演示模式，提交会立即展示，但刷新页面后不会保存。部署到 Netlify 后会变成真实上传。</p>`}
      <form class="form-grid" id="questionForm">
        <input type="hidden" name="invite_token" value="${escapeHtml(invite)}" />
        <div class="field-grid">
          <label>昵称<input name="uploader_name" required maxlength="40" placeholder="谁上传的" /></label>
          ${api.enabled ? `<label>口令<input name="passcode" type="password" required placeholder="邀请口令" /></label>` : `<input type="hidden" name="passcode" value="" />`}
        </div>
        <label>题目<textarea name="question_text" required placeholder="粘贴或整理题目内容；第一行会作为列表标题"></textarea></label>
        <div class="field-grid">
          <label>主分类
            <input name="category_name" list="categoryList" required placeholder="选择或输入新分类" />
            <datalist id="categoryList">${categoryOptions()}</datalist>
          </label>
          <label>标签<input name="tags" placeholder="React, 缓存, 系统设计" /></label>
        </div>
        <label>来源链接<input name="source_url" type="url" placeholder="可选" /></label>
        <label>答案<textarea name="answer" placeholder="可选；没有答案也可以先上传"></textarea></label>
        <div class="action-row">
          <button class="primary-button" type="submit" ${canSubmit ? "" : "disabled"}>提交题目</button>
          <span class="status-text" data-status></span>
        </div>
      </form>
    </section>
  `;
}

function renderAnswerForm(id) {
  const question = state.questions.find((item) => item.id === id);
  if (!question) {
    renderNotFound();
    return;
  }
  const invite = getInviteToken();
  app.innerHTML = `
    <section class="form-panel">
      <p class="eyebrow">Answer</p>
      <h2>${escapeHtml(question.title)}</h2>
      ${question.answer ? `<p class="form-note">这道题已经有答案了。</p>` : ""}
      ${invite ? "" : `<p class="form-note">补充答案需要邀请链接。请使用带 invite 参数的链接进入。</p>`}
      <form class="form-grid" id="answerForm">
        <input type="hidden" name="invite_token" value="${escapeHtml(invite)}" />
        <input type="hidden" name="question_id" value="${escapeHtml(id)}" />
        <div class="field-grid">
          <label>昵称<input name="answer_author" required maxlength="40" placeholder="谁补充的答案" /></label>
          <label>口令<input name="passcode" type="password" required placeholder="邀请口令" /></label>
        </div>
        <label>答案<textarea name="answer" required placeholder="写下这道题的参考答案"></textarea></label>
        <div class="action-row">
          <button class="primary-button" type="submit" ${invite && !question.answer ? "" : "disabled"}>提交答案</button>
          <span class="status-text" data-status></span>
        </div>
      </form>
    </section>
  `;
}

function renderNotFound() {
  app.innerHTML = `
    <section class="state-panel">
      <p class="eyebrow">Not Found</p>
      <h1>没有找到这个页面</h1>
      <p class="form-note"><a href="#/">回到今日题目</a></p>
    </section>
  `;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setStatus(form, text, type = "") {
  const status = form.querySelector("[data-status]");
  status.textContent = text;
  status.className = `status-text ${type}`;
}

async function handleSubmit(event) {
  const form = event.target;
  if (form.id !== "questionForm" && form.id !== "answerForm" && form.id !== "editQuestionForm") return;
  event.preventDefault();
  setStatus(form, "正在提交...");
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  try {
    const payload = formToObject(form);
    if (form.id === "questionForm" || form.id === "editQuestionForm") {
      payload.title = firstQuestionLine(payload.question_text);
      payload.body = payload.question_text.trim();
      if (!payload.body || !payload.title) {
        throw new Error("请填写题目");
      }
      delete payload.question_text;
      payload.tags = parseTags(payload.tags);
    }
    if (form.id === "questionForm") {
      const created = await api.createQuestion(payload);
      await loadData();
      const id = Array.isArray(created) ? created[0]?.id : created?.id;
      location.hash = id ? `#/question/${id}` : "#/";
    } else if (form.id === "editQuestionForm") {
      const updated = await api.updateQuestion(payload);
      await loadData();
      const id = Array.isArray(updated) ? updated[0]?.id : payload.question_id;
      location.hash = `#/question/${id}`;
    } else {
      const updated = await api.answerQuestion(payload);
      await loadData();
      const id = Array.isArray(updated) ? updated[0]?.id : payload.question_id;
      location.hash = `#/question/${id}`;
    }
  } catch (error) {
    setStatus(form, error.message || "提交失败", "error");
    button.disabled = false;
  }
}

function bindInteractions() {
  app.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle-answer]");
    if (!toggle) return;
    const panel = app.querySelector("[data-answer-panel]");
    if (!panel) return;
    panel.classList.toggle("open");
    toggle.textContent = panel.classList.contains("open") ? "收起答案" : "查看答案";
  });
  app.addEventListener("submit", handleSubmit);
}

async function renderRoute() {
  setActiveNav();
  await loadData();
  const hash = location.hash || "#/";
  const [path, query] = hash.slice(2).split("?");
  const params = new URLSearchParams(query || "");
  storeInvite(params.get("invite"));
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) renderHome();
  else if (parts[0] === "categories") renderCategories();
  else if (parts[0] === "category") renderCategories(parts[1]);
  else if (parts[0] === "question") renderQuestion(parts[1]);
  else if (parts[0] === "upload") renderUpload();
  else if (parts[0] === "answer") renderAnswerForm(parts[1]);
  else if (parts[0] === "edit") renderEditForm(parts[1]);
  else renderNotFound();
}

window.addEventListener("hashchange", renderRoute);
bindInteractions();
renderRoute().catch((error) => {
  app.innerHTML = `
    <section class="state-panel">
      <p class="eyebrow">Error</p>
      <h1>数据加载失败</h1>
      <p class="status-text error">${escapeHtml(error.message)}</p>
    </section>
  `;
});
