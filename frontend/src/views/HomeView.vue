<script setup>
import { computed } from "vue";
import { useQuestionStore } from "../store";
import CategorySidebar from "../components/CategorySidebar.vue";
import QuestionMeta from "../components/QuestionMeta.vue";
import QuestionCard from "../components/QuestionCard.vue";
import AnswerPanel from "../components/AnswerPanel.vue";

const store = useQuestionStore();
const latest = computed(() => store.state.questions[0] || null);
const recent = computed(() => store.state.questions.slice(1, 5));
</script>

<template>
  <section v-if="!store.state.loaded && store.state.loading" class="state-panel">
    <p class="eyebrow">Loading</p>
    <el-skeleton :rows="6" animated />
  </section>

  <section v-else-if="!latest" class="state-panel">
    <el-empty description="还没有题目">
      <template #default>
        <p class="form-note">拿到邀请链接后，可以从上传入口提交第一道面试题。</p>
      </template>
    </el-empty>
  </section>

  <template v-else>
    <section class="hero-grid">
      <article class="question-feature">
        <p class="eyebrow">Today's Question</p>
        <h1>{{ latest.title }}</h1>
        <QuestionMeta :question="latest" />
        <div v-if="latest.body && latest.body !== latest.title" class="question-body">{{ latest.body }}</div>
        <div class="tag-row">
          <span v-for="tag in latest.tags || []" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="action-row" style="margin-top: 24px;">
          <RouterLink v-if="!latest.answer" :to="{ name: 'answer', params: { id: latest.id } }">
            <el-button class="primary-button" type="primary">补充答案</el-button>
          </RouterLink>
          <AnswerPanel v-else :question="latest" />
          <RouterLink class="ghost-button" :to="{ name: 'question', params: { id: latest.id } }">
            打开详情
          </RouterLink>
          <RouterLink class="ghost-button" :to="{ name: 'edit', params: { id: latest.id } }">
            编辑题目
          </RouterLink>
        </div>
      </article>

      <CategorySidebar
        :categories="store.state.categories"
        :questions="store.state.questions"
        :active-id="latest.category_id"
      />
    </section>

    <section>
      <div class="section-head">
        <div>
          <p class="eyebrow">Archive</p>
          <h2>最近收录</h2>
        </div>
        <RouterLink class="pill-button" :to="{ name: 'categories' }">查看全部</RouterLink>
      </div>
      <div class="question-list">
        <QuestionCard v-for="question in recent" :key="question.id" :question="question" />
        <el-empty v-if="!recent.length" description="暂时只有今天这一题。" />
      </div>
    </section>
  </template>
</template>
