<template>
  <div class="page-container">
    <h1 class="page-title">选择密码类型</h1>
    <p class="page-subtitle">选择一种历史上使用过的密码，学习并破译它</p>

    <div class="type-list">
      <div
        v-for="t in types"
        :key="t.id"
        class="notebook-card type-card"
        @click="router.push(`/cipher/${t.id}/tutorial`)"
      >
        <div class="card-content">
          <h2 class="type-name">{{ t.name }}</h2>
          <p class="type-desc">{{ t.description }}</p>
          <span class="type-arrow">进入破译 →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCipherTypes } from "../api/index.js";

const router = useRouter();
const types = ref([]);

onMounted(async () => {
  types.value = await getCipherTypes();
});
</script>



<style scoped>
.type-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.type-card {
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.type-card:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--color-ink-navy);
}

.type-card:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 var(--color-ink-navy);
}

.type-name {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.type-desc {
  color: var(--color-graphite);
  font-size: 0.95rem;
}

.type-arrow {
  display: inline-block;
  margin-top: 12px;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-margin-red);
  font-weight: 700;
}
</style>
