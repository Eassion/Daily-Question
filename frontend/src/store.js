import { reactive, readonly } from "vue";
import * as questionsApi from "./api/questions";

const state = reactive({
  categories: [],
  questions: [],
  loaded: false,
  loading: false
});

let loadingPromise = null;

async function loadState(force = false) {
  if (!force && state.loaded) {
    return;
  }
  if (!force && loadingPromise) {
    return loadingPromise;
  }

  state.loading = true;
  loadingPromise = questionsApi.getState()
    .then((data) => {
      state.categories = data?.categories || [];
      state.questions = data?.questions || [];
      state.loaded = true;
    })
    .finally(() => {
      state.loading = false;
      loadingPromise = null;
    });

  return loadingPromise;
}

function findQuestion(id) {
  return state.questions.find((item) => item.id === id) || null;
}

function findCategory(id) {
  return state.categories.find((item) => item.id === id) || null;
}

function getInviteToken(route) {
  const fromQuery = typeof route?.query?.invite === "string" ? route.query.invite : "";
  if (fromQuery) {
    window.localStorage.setItem("daily-question-invite", fromQuery);
    return fromQuery;
  }
  return window.localStorage.getItem("daily-question-invite") || "";
}

function parseTags(value = "") {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8);
  }
  return String(value)
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function firstQuestionLine(value = "") {
  const firstLine = String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) || "";
  const normalized = firstLine.replace(/\s+/g, " ").trim();
  return normalized.length > 80 ? `${normalized.slice(0, 80)}...` : normalized;
}

async function submitQuestion(form) {
  const payload = {
    ...form,
    title: firstQuestionLine(form.question_text),
    body: String(form.question_text || "").trim(),
    tags: parseTags(form.tags)
  };

  if (!payload.title || !payload.body) {
    throw new Error("请填写题目");
  }

  delete payload.question_text;
  const created = await questionsApi.createQuestion(payload);
  await loadState(true);
  return created?.id;
}

async function submitEdit(form) {
  const payload = {
    ...form,
    title: firstQuestionLine(form.question_text),
    body: String(form.question_text || "").trim(),
    tags: parseTags(form.tags)
  };

  if (!payload.title || !payload.body) {
    throw new Error("请填写题目");
  }

  delete payload.question_text;
  const updated = await questionsApi.updateQuestion(payload);
  await loadState(true);
  return updated?.id || payload.question_id;
}

async function submitAnswer(form) {
  const updated = await questionsApi.answerQuestion(form);
  await loadState(true);
  return updated?.id || form.question_id;
}

export function useQuestionStore() {
  return {
    state: readonly(state),
    loadState,
    findQuestion,
    findCategory,
    getInviteToken,
    parseTags,
    firstQuestionLine,
    submitQuestion,
    submitEdit,
    submitAnswer
  };
}
