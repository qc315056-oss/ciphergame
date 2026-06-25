<template>
  <div class="decrypt-page">
    <!-- 顶部操作栏 -->
    <div class="decrypt-topbar">
      <button
        class="back-btn"
        @click="$router.push(`/cipher/${route.params.id}/levels`)"
      >
        ← 关卡列表
      </button>
      <span class="level-label">关卡 {{ route.params.levelId }}</span>
    </div>

    <!-- 四象限布局 -->
    <div class="quad-layout">
      <!-- TL -->
      <div class="quad-panel card-flat">
        <div v-if="getPanelFile('tl')" class="panel-content">
          <div class="panel-header">
            <span class="panel-file-title">{{ getPanelFile("tl").title }}</span>
            <button class="panel-remove" @click="removeFile('tl')">✕</button>
          </div>
          <div
            class="panel-body"
            v-html="formatContent(getPanelFile('tl').content)"
          ></div>
        </div>
        <div v-else class="panel-unassigned">
          <div class="unassigned-title">请选择文件固定</div>
          <div
            v-for="f in availableFiles"
            :key="f.id"
            class="unassigned-file"
            @click="assignFile('tl', f)"
          >
            {{ f.title }}
          </div>
          <div v-if="availableFiles.length === 0" class="unassigned-empty">
            所有文件已分配
          </div>
        </div>
      </div>

      <!-- TR -->
      <div class="quad-panel card-flat">
        <div v-if="getPanelFile('tr')" class="panel-content">
          <div class="panel-header">
            <span class="panel-file-title">{{ getPanelFile("tr").title }}</span>
            <button class="panel-remove" @click="removeFile('tr')">✕</button>
          </div>
          <div
            class="panel-body"
            v-html="formatContent(getPanelFile('tr').content)"
          ></div>
        </div>
        <div v-else class="panel-unassigned">
          <div class="unassigned-title">请选择文件固定</div>
          <div
            v-for="f in availableFiles"
            :key="f.id"
            class="unassigned-file"
            @click="assignFile('tr', f)"
          >
            {{ f.title }}
          </div>
          <div v-if="availableFiles.length === 0" class="unassigned-empty">
            所有文件已分配
          </div>
        </div>
      </div>

      <!-- BL: 网格笔记本 -->
      <div class="quad-grid card-flat">
        <div ref="scrollRef" class="grid-scroll">
          <div class="grid-table" :style="gridStyle">
            <input
              v-for="cell in allCells"
              :key="`${cell.ri}-${cell.ci}`"
              :ref="(el) => setCellRef(el, cell.ri, cell.ci)"
              class="grid-cell"
              :value="grid[cell.ri]?.[cell.ci] || ''"
              @input="onCellInput($event, cell.ri, cell.ci)"
              @keydown="onCellKeydown($event, cell.ri, cell.ci)"
            />
          </div>
        </div>
      </div>

      <!-- BR -->
      <div class="quad-panel card-flat">
        <div v-if="getPanelFile('br')" class="panel-content">
          <div class="panel-header">
            <span class="panel-file-title">{{ getPanelFile("br").title }}</span>
            <button class="panel-remove" @click="removeFile('br')">✕</button>
          </div>
          <div
            class="panel-body"
            v-html="formatContent(getPanelFile('br').content)"
          ></div>
        </div>
        <div v-else class="panel-unassigned">
          <div class="unassigned-title">请选择文件固定</div>
          <div
            v-for="f in availableFiles"
            :key="f.id"
            class="unassigned-file"
            @click="assignFile('br', f)"
          >
            {{ f.title }}
          </div>
          <div v-if="availableFiles.length === 0" class="unassigned-empty">
            所有文件已分配
          </div>
        </div>
      </div>
    </div>

    <!-- 答案区域 -->
    <div class="answer-section">
      <div v-if="!submitted">
        <div class="answer-label">输入你的破译结果</div>
        <div class="answer-row">
          <input
            v-model="answer"
            class="answer-input"
            placeholder="在此输入明文..."
            @keyup.enter="submitAnswer"
          />
          <button class="btn-primary btn-flat" @click="submitAnswer">
            提交
          </button>
        </div>
      </div>

      <div v-else class="result-section">
        <div
          v-if="result"
          class="result-box"
          :class="result.correct ? 'correct' : 'wrong'"
        >
          <div class="result-icon">{{ result.correct ? "✓" : "✗" }}</div>
          <div class="result-text">
            {{ result.correct ? "破译成功！" : "破译失败，再试一次" }}
          </div>
          <button v-if="!result.correct" class="btn-flat" @click="reset">
            重试
          </button>
          <button
            v-if="result.correct"
            class="btn-flat"
            @click="showExplanation = !showExplanation"
          >
            {{ showExplanation ? "隐藏解析" : "查看解析" }}
          </button>
        </div>

        <div
          v-if="
            result && result.correct && showExplanation && result.explanation
          "
          class="explanation-box card-flat"
        >
          <div
            class="explanation-body"
            v-html="result.explanation.replace(/\n/g, '<br>')"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute, onBeforeRouteLeave } from "vue-router";
import { getLevelFiles, checkAnswer } from "../api/index.js";

const route = useRoute();
const files = ref([]);
const loading = ref(true);
const submitted = ref(false);
const result = ref(null);
const answer = ref("");
const showExplanation = ref(false);

const assignments = ref({ tl: null, tr: null, br: null });

// 网格
const CELL_SIZE = 40;
const grid = ref([[""]]);
const cellRefs = ref({});
const scrollRef = ref(null);

onMounted(async () => {
  files.value = await getLevelFiles(route.params.levelId);
  loading.value = false;
  await nextTick();
  calcGridSize();
  loadLevelState();
  // 监听容器大小变化
  if (scrollRef.value) {
    const ro = new ResizeObserver(() => {
      expandGridToFit();
    });
    ro.observe(scrollRef.value);
  }
});

// 根据容器大小计算初始行列数填满空间
function calcGridSize() {
  const el = scrollRef.value;
  if (!el) return;
  const cols = Math.max(1, Math.floor(el.clientWidth / (CELL_SIZE + 2)));
  const rows = Math.max(1, Math.floor(el.clientHeight / (CELL_SIZE + 2)));
  grid.value = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "")
  );
}

// 容器大小变化时，只扩不缩（保留已有数据）
function expandGridToFit() {
  const el = scrollRef.value;
  if (!el) return;
  const needCols = Math.max(1, Math.floor(el.clientWidth / (CELL_SIZE + 2)));
  const needRows = Math.max(1, Math.floor(el.clientHeight / (CELL_SIZE + 2)));

  // 扩展列
  while (grid.value[0]?.length < needCols) {
    grid.value.forEach((row) => row.push(""));
  }
  // 扩展行
  while (grid.value.length < needRows) {
    const cols = grid.value[0]?.length || 1;
    grid.value.push(Array.from({ length: cols }, () => ""));
  }
}

//扩展网格
function expandGridIfNeeded(targetRi, targetCi) {
  let changed = false;
  const needRows = targetRi + 2;
  const needCols = targetCi + 2;

  while (grid.value[0]?.length < needCols) {
    grid.value.forEach((row) => row.push(""));
    changed = true;
  }

  while (grid.value.length < needRows) {
    const cols = grid.value[0]?.length || 1;
    grid.value.push(Array.from({ length: cols }, () => ""));
    changed = true;
  }
  return changed;
}

// 计算所有单元格位置
const allCells = computed(() => {
  const rows = grid.value.length;
  const cols = grid.value[0]?.length || 0;
  const list = [];
  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      list.push({ ri, ci });
    }
  }
  return list;
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${grid.value[0]?.length || 1}, ${CELL_SIZE}px)`,
  gridTemplateRows: `repeat(${grid.value.length}, ${CELL_SIZE}px)`,
}));

// 可用文件
const availableFiles = computed(() => {
  const assigned = new Set();
  Object.values(assignments.value).forEach((f) => {
    if (f) assigned.add(f.file_type);
  });
  return files.value.filter((f) => !assigned.has(f.file_type));
});

function assignFile(panel, file) {
  assignments.value[panel] = file;
}

function removeFile(panel) {
  assignments.value[panel] = null;
}

function getPanelFile(panel) {
  return assignments.value[panel];
}

function formatContent(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "<br>")
    .replace(/\s{2,}/g, (m) => "&nbsp;".repeat(m.length));
}

// 保存关卡状态（网格、文件分配、答案输入）
const STORAGE_KEY = computed(() => `cipher_level_${route.params.levelId}`);

function saveLevelState() {
  const state = {
    grid: grid.value,
    assignments: {
      tl: assignments.value.tl?.id || null,
      tr: assignments.value.tr?.id || null,
      br: assignments.value.br?.id || null,
    },
    answer: answer.value,
  };
  localStorage.setItem(STORAGE_KEY.value, JSON.stringify(state));
}

function loadLevelState() {
  const raw = localStorage.getItem(STORAGE_KEY.value);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    if (state.grid) grid.value = state.grid;
    if (state.answer) answer.value = state.answer;
    if (state.assignments && files.value.length) {
      Object.keys(state.assignments).forEach((panel) => {
        const fileId = state.assignments[panel];
        if (fileId) {
          const file = files.value.find((f) => f.id === fileId);
          if (file) assignments.value[panel] = file;
        }
      });
    }
  } catch (e) {
    /* ignore corrupt data */
  }
}

function clearLevelState() {
  localStorage.removeItem(STORAGE_KEY.value);
}

// 自动保存（网格单独在 onCellInput 中保存）
watch(answer, saveLevelState);
watch(assignments, saveLevelState, { deep: true });
onBeforeRouteLeave(saveLevelState);

// 提交答案
async function submitAnswer() {
  if (!answer.value.trim()) return;
  submitted.value = true;
  result.value = await checkAnswer(route.params.levelId, answer.value.trim());
  if (result.value.correct) {
    const progress = JSON.parse(
      localStorage.getItem("cipher_progress") || "{}"
    );
    progress[route.params.levelId] = true;
    localStorage.setItem("cipher_progress", JSON.stringify(progress));
  }
}

function reset() {
  submitted.value = false;
  result.value = null;
  answer.value = "";
  showExplanation.value = false;
  clearLevelState();
  // 重置网格
  calcGridSize();
}

// 网格操作
function onCellInput(e, ri, ci) {
  const val = e.target.value.slice(-1).toUpperCase();
  grid.value[ri][ci] = val;
  if (val) {
    expandGridIfNeeded(ri, ci);
    const nextKey = `${ri}-${ci + 1}`;
    nextTick(() => {
      const el = cellRefs.value[nextKey];
      if (el) el.focus();
    });
  }
  saveLevelState();
}

// function onCellKeydown(e, ri, ci) {
//   const maxR = grid.value.length;
//   const maxC = grid.value[0]?.length || 0;
//   let tr = ri,
//     tc = ci;

//   switch (e.key) {
//     case "ArrowRight":
//       e.preventDefault();
//       tc = Math.min(ci + 1, maxC - 1);
//       break;
//     case "ArrowLeft":
//       e.preventDefault();
//       tc = Math.max(ci - 1, 0);
//       break;
//     case "ArrowDown":
//       e.preventDefault();
//       tr = Math.min(ri + 1, maxR - 1);
//       break;
//     case "ArrowUp":
//       e.preventDefault();
//       tr = Math.max(ri - 1, 0);
//       break;
//     case "Enter":
//       e.preventDefault();
//       tc = Math.min(ci + 1, maxC - 1);
//       break;
//   }

//   if (tr !== ri || tc !== ci) {
//     const key = `${tr}-${tc}`;
//     cellRefs.value[key]?.focus();
//   }
// }

async function onCellKeydown(e, ri, ci) {
  let tr = ri,
    tc = ci;

  switch (e.key) {
    case "ArrowRight":
      e.preventDefault();
      tc = ci + 1;
      break;
    case "Enter":
      e.preventDefault();
      tr = ri + 1;
      break;
    case "ArrowLeft":
      e.preventDefault();
      tc = Math.max(ci - 1, 0);
      break;
    case "ArrowDown":
      e.preventDefault();
      tr = ri + 1;
      break;
    case "ArrowUp":
      e.preventDefault();
      tr = Math.max(ri - 1, 0);
      break;
    case "Backspace":
      e.preventDefault();
      grid.value[ri][ci] = "";
      tc = Math.max(ci - 1, 0);
      break;
  }

  if (tr !== ri || tc !== ci) {
    const isExpanded = expandGridIfNeeded(tr, tc);
    if (isExpanded) {
      await nextTick();
    }

    const key = `${tr}-${tc}`;
    cellRefs.value[key]?.focus();
  }
}

function setCellRef(el, ri, ci) {
  if (el) cellRefs.value[`${ri}-${ci}`] = el;
}
</script>



<style scoped>
.decrypt-page {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: 100vh;
}

.decrypt-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.back-btn {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: none;
  border: none;
  padding: 0;
  color: var(--color-graphite);
  cursor: pointer;
  box-shadow: none;
  border-radius: 0;
}

.back-btn:hover {
  color: var(--color-ink-navy);
}

.level-label {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-margin-red);
  font-weight: 700;
}

/* 四象限布局 */
.quad-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  flex-shrink: 0;
  height: calc(100vh - 220px);
  min-height: 0;
}

.quad-panel,
.quad-grid {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.card-flat {
  background: var(--color-paper-soft);
  border: 1.5px solid var(--color-ink-navy);
  border-radius: 10px;
}

/* 按钮无阴影 */
.btn-flat,
.quad-panel button,
.answer-section button {
  box-shadow: none !important;
}
.btn-flat:hover,
.quad-panel button:hover,
.answer-section button:hover {
  transform: translate(-1px, -1px);
  box-shadow: none !important;
}
.btn-flat:active,
.quad-panel button:active,
.answer-section button:active {
  transform: translate(1px, 1px);
  box-shadow: none !important;
}

/* 未分配状态 */
.panel-unassigned {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* flex: 1; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

.unassigned-title {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-graphite);
  font-weight: 700;
}

.unassigned-file {
  font-family: var(--font-serif);
  font-size: 1rem;
  padding: 8px 20px;
  border: 1.5px solid var(--color-ink-navy);
  border-radius: 4px;
  cursor: pointer;
  background: var(--color-paper-soft);
  width: 100%;
  text-align: center;
  transition: transform 0.1s;
}

.unassigned-file:hover {
  transform: translate(-1px, -1px);
}

.unassigned-empty {
  font-family: var(--font-display);
  color: var(--color-graphite);
  font-size: 1.1rem;
}

/* 已分配状态 */
.panel-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* flex: 1; */
  display: flex;
  flex-direction: column;
  padding: 14px;
  min-height: 0;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.panel-file-title {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--color-margin-red);
}

.panel-remove {
  border: none;
  background: none;
  font-size: 1rem;
  padding: 2px 6px;
  color: var(--color-graphite);
  cursor: pointer;
}

.panel-remove:hover {
  color: var(--color-margin-red);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  font-family: var(--font-serif);
  font-size: 0.9rem;
  /* white-space: normal;
  line-height: 1.6;
  word-break: keep-all; */
  white-space: pre-wrap;
  word-break: break-all;
  padding-right: 12px;
}

/* hint-pin: 带下划线与悬停批注 */
:deep(.hint-pin) {
  text-decoration: underline wavy var(--color-margin-red);
  text-underline-offset: 3px;
  cursor: help;
  position: relative;
  color: var(--color-margin-red);
}

:deep(.hint-pin::after) {
  content: attr(data-hint);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: #fef9c3;
  border: 1.5px solid var(--color-ink-navy);
  border-radius: 4px;
  padding: 6px 14px;
  font-family: var(--font-display, "Caveat", cursive);
  font-size: 0.85rem;
  color: var(--color-ink-navy);
  box-shadow: 2px 2px 0 var(--color-ink-navy);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  z-index: 10;
}

:deep(.hint-pin:hover::after) {
  opacity: 1;
}

/* 网格 — 填满框，可滚动，自动扩展 */
.quad-grid {
  overflow: hidden;
}

.grid-scroll {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* flex: 1; */
  overflow: auto;
  padding: 10px;
}

.grid-table {
  display: grid;
  gap: 2px;
  width: fit-content;
}

.grid-cell {
  width: 40px;
  height: 40px;
  text-align: center;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
  border: 1.5px solid var(--color-ink-navy);
  border-radius: 3px;
  background: var(--color-paper-soft);
  color: var(--color-ink-navy);
  padding: 0;
  text-transform: uppercase;
  box-shadow: none;
}

.grid-cell:focus,
.grid-cell:focus-visible {
  outline: none;
  box-shadow: none;
  transform: none;
}

/* 答案区域 */
.answer-section {
  padding: 8px 0;
  flex-shrink: 0;
}

.answer-label {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-graphite);
}

.answer-row {
  display: flex;
  gap: 10px;
}

.answer-input {
  flex: 1;
  text-transform: uppercase;
  font-size: 1.1rem;
  letter-spacing: 0.15em;
  box-shadow: none;
}

.answer-input:focus-visible {
  outline: none;
  box-shadow: none;
  transform: none;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 1.5px solid var(--color-ink-navy);
  border-radius: 4px;
}

.result-box.correct {
  background: var(--color-mint);
}
.result-box.wrong {
  background: var(--color-paper-soft);
}

.result-icon {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: 700;
}

.correct .result-icon {
  color: #2a7a4a;
}
.wrong .result-icon {
  color: var(--color-margin-red);
}

.result-text {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  flex: 1;
}

.explanation-box {
  margin-top: 8px;
}

.explanation-body {
  padding: 16px 20px;
  font-family: var(--font-serif);
  font-size: 0.9rem;
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
