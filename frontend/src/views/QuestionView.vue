<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useQuestionStore } from "../store";
import QuestionMeta from "../components/QuestionMeta.vue";
import AnswerPanel from "../components/AnswerPanel.vue";

const route = useRoute();
const store = useQuestionStore();
const question = computed(() => store.findQuestion(String(route.params.id || "")));
</script>

<template>
  <section v-if="!question" class="state-panel">
    <el-empty description="没有找到这个页面">
      <RouterLink :to="{ name: 'home' }">回到今日题目</RouterLink>
    </el-empty>
  </section>

  <article v-else class="question-feature">
    <p class="eyebrow">Question</p>
    <h1>{{ question.title }}</h1>
    <QuestionMeta :question="question" />
    <div v-if="question.body && question.body !== question.title" class="question-body">{{ question.body }}</div>
    <div class="tag-row">
      <span v-for="tag in question.tags || []" :key="tag" class="tag">{{ tag }}</span>
    </div>
    <div class="action-row" style="margin-top: 24px;">
      <RouterLink v-if="!question.answer" :to="{ name: 'answer', params: { id: question.id } }">
        <el-button class="primary-button" type="primary">补充答案</el-button>
      </RouterLink>
      <AnswerPanel v-else :question="question" />
      <RouterLink class="ghost-button" :to="{ name: 'edit', params: { id: question.id } }">
        编辑题目
      </RouterLink>
      <RouterLink class="ghost-button" :to="{ name: 'categories' }">
        返回题库
      </RouterLink>
    </div>
  </article>
</template>
