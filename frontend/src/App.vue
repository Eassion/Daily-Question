<script setup>
import { onMounted } from "vue";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { RouterView } from "vue-router";
import SiteHeader from "./components/SiteHeader.vue";
import { useQuestionStore } from "./store";

const store = useQuestionStore();

onMounted(() => {
  store.loadState();
});
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <div>
      <SiteHeader />
      <main class="app-shell" aria-live="polite">
        <RouterView />
      </main>
    </div>
  </ElConfigProvider>
</template>
