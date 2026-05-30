<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useQuestionStore } from "../store";

const route = useRoute();
const router = useRouter();
const store = useQuestionStore();
const invite = store.getInviteToken(route);

const form = reactive({
  invite_token: invite,
  uploader_name: "",
  passcode: "",
  question_text: "",
  category_name: "",
  tags: "",
  source_url: "",
  answer: ""
});

const submitting = ref(false);
const status = ref("");
const statusType = ref("");

async function submit() {
  submitting.value = true;
  statusType.value = "";
  status.value = "正在提交...";
  try {
    const id = await store.submitQuestion(form);
    ElMessage.success("题目提交成功");
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
  <section class="form-panel">
    <p class="eyebrow">Submit</p>
    <h2>上传一道好题</h2>
    <p v-if="!invite" class="form-note">当前没有检测到邀请链接，请使用带 invite 参数的链接进入。</p>
    <form class="form-grid" @submit.prevent="submit">
      <input v-model="form.invite_token" type="hidden" name="invite_token" />
      <div class="field-grid">
        <label>昵称<input v-model="form.uploader_name" required maxlength="40" placeholder="谁上传的" /></label>
        <label>口令<input v-model="form.passcode" type="password" required placeholder="邀请口令" /></label>
      </div>
      <label>题目<textarea v-model="form.question_text" required placeholder="第一行会作为列表标题"></textarea></label>
      <div class="field-grid">
        <label>
          主分类
          <input v-model="form.category_name" list="category-list" required placeholder="选择或输入新分类" />
          <datalist id="category-list">
            <option v-for="category in store.state.categories" :key="category.id" :value="category.name" />
          </datalist>
        </label>
        <label>标签<input v-model="form.tags" placeholder="React, 缓存, 系统设计" /></label>
      </div>
      <label>来源链接<input v-model="form.source_url" type="url" placeholder="可选" /></label>
      <label>答案<textarea v-model="form.answer" placeholder="可选；没有答案也可以先上传"></textarea></label>
      <div class="action-row">
        <el-button class="primary-button" type="primary" native-type="submit" :loading="submitting" :disabled="!invite">提交题目</el-button>
        <span class="status-text" :class="statusType">{{ status }}</span>
      </div>
    </form>
  </section>
</template>
