<template>
  <div class="page-container">
    <button class="back-btn" @click="router.push('/cipher-types')">
      ← 返回
    </button>

    <h1 class="page-title">密码手册</h1>
    <p class="page-subtitle">仔细阅读并理解加密规则，然后开始破译</p>

    <div class="notebook-card" v-if="tutorial">
      <div class="card-content tutorial-content">{{ tutorial.content }}</div>
    </div>

    <div class="tutorial-footer">
      <button
        class="btn-primary"
        @click="router.push(`/cipher/${route.params.id}/levels`)"
      >
        开始破译
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTutorial } from "../api/index.js";

const route = useRoute();
const router = useRouter();
const tutorial = ref(null);

onMounted(async () => {
  tutorial.value = await getTutorial(route.params.id);
});
</script>



<style scoped>
.back-btn {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  margin-bottom: 20px;
  color: var(--color-graphite);
}

.back-btn:hover {
  box-shadow: none;
  color: var(--color-ink-navy);
}

.tutorial-content {
  white-space: pre-wrap;
  line-height: 1.5625rem;
}

.tutorial-content :deep(h2) {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  margin: 20px 0 10px;
  color: var(--color-margin-red);
}

.tutorial-content :deep(p) {
  margin-bottom: 10px;
}

.tutorial-content :deep(ol),
.tutorial-content :deep(ul) {
  margin: 10px 0;
  padding-left: 24px;
}

.tutorial-content :deep(li) {
  margin-bottom: 6px;
}

.tutorial-footer {
  margin-top: 32px;
  text-align: center;
}
</style>
