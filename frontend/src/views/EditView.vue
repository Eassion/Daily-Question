<script setup>
import { reactive, ref, watchEffect } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useQuestionStore } from "../store";
import { tagsText } from "../utils";

const route = useRoute();
const router = useRouter();
const store = useQuestionStore();
const invite = store.getInviteToken(route);
const submitting = ref(false);
const status = ref("");
const statusType = ref("");

const form = reactive({
  invite_token: invite,
  question_id: String(route.params.id || ""),
  editor_name: "",
  passcode: "",
  question_text: "",
  category_name: "",
  tags: "",
  source_url: "",
  answer: ""
});

watchEffect(() => {
  const question = store.findQuestion(String(route.params.id || ""));
  if (!question) return;
  form.question_id = question.id;
  form.question_text = question.body || question.title || "";
  form.category_name = question.category_name || "";
  form.tags = tagsText(question.tags || []);
  form.source_url = question.source_url || "";
  form.answer = question.answer || "";
});

async function submit() {
  submitting.value = true;
  statusType.value = "";
  status.value = "正在提交...";
  try {
    const id = await store.submitEdit(form);
    ElMessage.success("题目修改已保存");
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
  <section v-if="!store.findQuestion(String(route.params.id || ''))" class="state-panel">
    <p class="eyebrow">Not Found</p>
    <h1>没有找到这个页面</h1>
  </section>

  <section v-else class="form-panel">
    <p class="eyebrow">Edit</p>
    <h2>编辑题目</h2>
    <p v-if="!invite" class="form-note">编辑需要邀请链接，请使用带 invite 参数的链接进入。</p>
    <form class="form-grid" @submit.prevent="submit">
      <input v-model="form.invite_token" type="hidden" />
      <input v-model="form.question_id" type="hidden" />
      <div class="field-grid">
        <label>编辑者昵称<input v-model="form.editor_name" required maxlength="40" placeholder="谁修改的" /></label>
        <label>口令<input v-model="form.passcode" type="password" required placeholder="邀请口令" /></label>
      </div>
      <label>题目<textarea v-model="form.question_text" required></textarea></label>
      <div class="field-grid">
        <label>
          主分类
          <input v-model="form.category_name" list="edit-category-list" required placeholder="选择或输入新分类" />
          <datalist id="edit-category-list">
            <option v-for="category in store.state.categories" :key="category.id" :value="category.name" />
          </datalist>
        </label>
        <label>标签<input v-model="form.tags" placeholder="React, 缓存, 系统设计" /></label>
      </div>
      <label>来源链接<input v-model="form.source_url" type="url" placeholder="可选" /></label>
      <label>答案<textarea v-model="form.answer" placeholder="可选"></textarea></label>
      <div class="action-row">
        <el-button class="primary-button" type="primary" native-type="submit" :loading="submitting" :disabled="!invite">保存修改</el-button>
        <RouterLink class="ghost-button" :to="{ name: 'question', params: { id: form.question_id } }">取消</RouterLink>
        <span class="status-text" :class="statusType">{{ status }}</span>
      </div>
    </form>
  </section>
</template>
