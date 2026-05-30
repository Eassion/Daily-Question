<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  questions: { type: Array, default: () => [] },
  activeId: { type: String, default: "" }
});

function questionCount(questions, categoryId) {
  return questions.filter((item) => item.category_id === categoryId).length;
}
</script>

<template>
  <aside class="side-panel">
    <div class="side-title">Categories</div>
    <div class="category-list">
      <RouterLink class="category-link" :to="{ name: 'categories' }">
        <span>全部题目</span>
        <span>{{ questions.length }}</span>
      </RouterLink>
      <RouterLink
        v-for="category in categories"
        :key="category.id"
        class="category-link"
        :class="{ active: activeId === category.id }"
        :to="{ name: 'category', params: { id: category.id } }"
      >
        <span>{{ category.name }}</span>
        <span>{{ questionCount(questions, category.id) }}</span>
      </RouterLink>
      <p v-if="!categories.length" class="empty-note">还没有分类。</p>
    </div>
  </aside>
</template>
