<template>
  <div class="page-container">
    <button
      class="back-btn"
      @click="router.push(`/cipher/${route.params.id}/tutorial`)"
    >
      ← 返回教程
    </button>

    <h1 class="page-title">选择关卡</h1>

    <div class="level-list">
      <div
        v-for="(lv, idx) in levels"
        :key="lv.id"
        class="notebook-card level-card"
        @click="router.push(`/cipher/${route.params.id}/level/${lv.id}`)"
      >
        <div class="card-content">
          <span class="level-num">
            关卡 {{ idx + 1 }}
            <span v-if="completed.has(lv.id)" class="level-done">✓ 已完成</span>
          </span>
          <h2 class="level-name">{{ lv.name }}</h2>
          <span class="level-enter">进入破译 →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getLevels } from "../api/index.js";

const route = useRoute();
const router = useRouter();
const levels = ref([]);
const completed = ref(new Set());

onMounted(async () => {
  levels.value = await getLevels(route.params.id);
  const progress = JSON.parse(localStorage.getItem("cipher_progress") || "{}");
  Object.keys(progress).forEach((id) => {
    if (progress[id]) completed.value.add(Number(id));
  });
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

.level-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.level-card {
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.level-card:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--color-ink-navy);
}

.level-card:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 var(--color-ink-navy);
}

.level-num {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-margin-red);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-done {
  color: #2a7a4a;
  font-size: 0.65rem;
}

.level-name {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 4px;
}

.level-enter {
  display: inline-block;
  margin-top: 8px;
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-navy);
  font-weight: 600;
}
</style>
