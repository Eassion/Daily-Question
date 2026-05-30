<script setup>
import { computed, ref } from "vue";
import { formatDate } from "../utils";

const props = defineProps({
  question: { type: Object, required: true },
  initiallyOpen: { type: Boolean, default: false }
});

const open = ref(props.initiallyOpen);
const hasAnswer = computed(() => Boolean(props.question.answer));
</script>

<template>
  <div v-if="hasAnswer">
    <el-button class="primary-button" type="primary" @click="open = !open">
      {{ open ? "收起答案" : "查看答案" }}
    </el-button>
    <section v-if="open" class="answer-panel open">
      <p class="eyebrow">Answer</p>
      <div class="answer-body">{{ question.answer }}</div>
      <div class="meta-row">
        <span>由 {{ question.answer_author || "匿名" }} 补充</span>
        <span v-if="question.answered_at">{{ formatDate(question.answered_at) }}</span>
      </div>
    </section>
  </div>
  <p v-else class="form-note">还没有答案，受邀者可以补充。</p>
</template>
