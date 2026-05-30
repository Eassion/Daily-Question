import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LibraryView from "../views/LibraryView.vue";
import QuestionView from "../views/QuestionView.vue";
import UploadView from "../views/UploadView.vue";
import EditView from "../views/EditView.vue";
import AnswerView from "../views/AnswerView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import { useQuestionStore } from "../store";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/categories", name: "categories", component: LibraryView },
    { path: "/category/:id", name: "category", component: LibraryView, props: true },
    { path: "/question/:id", name: "question", component: QuestionView, props: true },
    { path: "/upload", name: "upload", component: UploadView },
    { path: "/edit/:id", name: "edit", component: EditView, props: true },
    { path: "/answer/:id", name: "answer", component: AnswerView, props: true },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async () => {
  const store = useQuestionStore();
  await store.loadState();
});

export default router;
