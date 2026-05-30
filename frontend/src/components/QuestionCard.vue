<script setup>
import { questionExcerpt, formatDate } from "../utils";

defineProps({
  question: { type: Object, required: true }
});
</script>

<template>
  <RouterLink class="list-card" :to="{ name: 'question', params: { id: question.id } }">
    <div class="tag-row">
      <span class="category-chip">{{ question.category_name || "未分类" }}</span>
      <span class="answer-badge">{{ question.answer ? "已有答案" : "待补答案" }}</span>
    </div>
    <h3>{{ question.title }}</h3>
    <p>{{ questionExcerpt(question) }}</p>
    <div class="meta-row">
      <span>{{ formatDate(question.uploaded_at) }}</span>
      <span>{{ question.uploader_name || "匿名" }}</span>
    </div>
    <div class="tag-row">
      <span v-for="tag in question.tags || []" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </RouterLink>
</template>
