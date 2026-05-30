<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useQuestionStore } from "../store";

const route = useRoute();
const store = useQuestionStore();

const uploadTarget = computed(() => {
  const invite = store.getInviteToken(route);
  return invite
    ? { name: "upload", query: { invite } }
    : { name: "upload" };
});
</script>

<template>
  <header class="site-header">
    <RouterLink class="brand" :to="{ name: 'home' }">
      <span class="brand-mark">Q</span>
      <span>
        <strong>每日面试题</strong>
        <small>Daily Question</small>
      </span>
    </RouterLink>
    <nav class="top-nav">
      <RouterLink :to="{ name: 'home' }">今日</RouterLink>
      <RouterLink :to="{ name: 'categories' }">分类</RouterLink>
      <RouterLink :to="uploadTarget">上传</RouterLink>
    </nav>
  </header>
</template>
