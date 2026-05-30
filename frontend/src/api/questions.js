import axios from "axios";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const http = axios.create({
  baseURL: apiBase,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

async function request(config) {
  try {
    const response = await http.request(config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "请求失败";
    throw new Error(message);
  }
}

export function getState() {
  return request({
    url: "/api/questions",
    method: "GET"
  });
}

export function createQuestion(payload) {
  return request({
    url: "/api/questions",
    method: "POST",
    data: payload
  });
}

export function updateQuestion(payload) {
  return request({
    url: "/api/questions",
    method: "PATCH",
    data: payload
  });
}

export function answerQuestion(payload) {
  return request({
    url: "/api/questions",
    method: "PUT",
    data: payload
  });
}
