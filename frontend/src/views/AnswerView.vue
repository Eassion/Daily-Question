<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useQuestionStore } from "../store";

const route = useRoute();
const router = useRouter();
const store = useQuestionStore();
const question = store.findQuestion(String(route.params.id || ""));
const invite = store.getInviteToken(route);

const form = reactive({
  invite_token: invite,
  question_id: String(route.params.id || ""),
  answer_author: "",
  passcode: "",
  answer: ""
});

const submitting = ref(false);
const status = ref("");
const statusType = ref("");

async function submit() {
  submitting.value = true;
  status.value = "正在提交...";
  statusType.value = "";
  try {
    const id = await store.submitAnswer(form);
    ElMessage.success("答案提交成功");
    await router.push({ name: "question", params: { id } });
  } catch (error) {
    status.value = error.message || "提交失败";
    statusType.value = "error";
    ElMessage.error(status.value);
    submitting.value = false;
  }
}
</script>

<template>
  <section v-if="!question" class="state-panel">
    <p class="eyebrow">Not Found</p>
    <h1>没有找到这个页面</h1>
  </section>

  <section v-else class="form-panel">
    <p class="eyebrow">Answer</p>
    <h2>{{ question.title }}</h2>
    <p v-if="question.answer" class="form-note">这道题已经有答案了。</p>
    <p v-if="!invite" class="form-note">补充答案需要邀请链接，请使用带 invite 参数的链接进入。</p>
    <form class="form-grid" @submit.prevent="submit">
      <input v-model="form.invite_token" type="hidden" />
      <input v-model="form.question_id" type="hidden" />
      <div class="field-grid">
        <label>昵称<input v-model="form.answer_author" required maxlength="40" placeholder="谁补充的答案" /></label>
        <label>口令<input v-model="form.passcode" type="password" required placeholder="邀请口令" /></label>
      </div>
      <label>答案<textarea v-model="form.answer" required placeholder="写下这道题的参考答案"></textarea></label>
      <div class="action-row">
        <el-button class="primary-button" type="primary" native-type="submit" :loading="submitting" :disabled="!invite || Boolean(question.answer)">提交答案</el-button>
        <span class="status-text" :class="statusType">{{ status }}</span>
      </div>
    </form>
  </section>
</template>
