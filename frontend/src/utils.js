export function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function questionExcerpt(question) {
  const text = String(question.body || question.title || "").trim();
  return `${text.slice(0, 150)}${text.length > 150 ? "..." : ""}`;
}

export function tagsText(tags = []) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}
