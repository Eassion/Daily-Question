<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useQuestionStore } from "../store";
import CategorySidebar from "../components/CategorySidebar.vue";
import QuestionCard from "../components/QuestionCard.vue";

const route = useRoute();
const store = useQuestionStore();

const categoryId = computed(() => String(route.params.id || ""));
const selectedCategory = computed(() => store.findCategory(categoryId.value));
const questions = computed(() => {
  if (!categoryId.value) {
    return store.state.questions;
  }
  return store.state.questions.filter((item) => item.category_id === categoryId.value);
});
</script>

<template>
  <section class="hero-grid">
    <div>
      <div class="section-head" style="margin-top: 0;">
        <div>
          <p class="eyebrow">Library</p>
          <h2>{{ selectedCategory ? selectedCategory.name : "全部题目" }}</h2>
          <p>{{ selectedCategory ? "这个分类下的每日题目。" : "按分类和标签慢慢积累起来的面试题库。" }}</p>
        </div>
      </div>
      <div class="question-list">
        <QuestionCard v-for="question in questions" :key="question.id" :question="question" />
        <el-empty v-if="!questions.length" description="这个分类还没有题目。" />
      </div>
    </div>

    <CategorySidebar
      :categories="store.state.categories"
      :questions="store.state.questions"
      :active-id="categoryId"
    />
  </section>
</template>
