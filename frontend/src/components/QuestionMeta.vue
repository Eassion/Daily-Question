<script setup>
import { formatDate } from "../utils";

defineProps({
  question: { type: Object, required: true }
});
</script>

<template>
  <div class="meta-row">
    <span class="category-chip">{{ question.category_name || "未分类" }}</span>
    <span>{{ formatDate(question.uploaded_at) }}</span>
    <span>由 {{ question.uploader_name || "匿名" }} 上传</span>
    <a
      v-if="question.source_url"
      :href="question.source_url"
      target="_blank"
      rel="noreferrer"
    >
      来源链接
    </a>
    <span class="answer-badge">{{ question.answer ? "已有答案" : "等待答案" }}</span>
  </div>
</template>
