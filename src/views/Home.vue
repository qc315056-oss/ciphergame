<template>
  <div class="scroll-root">
    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-label">Cipher Breaker</div>
        <h1 class="hero-title">密文破译</h1>
        <p class="hero-desc">重现历史上的密码</p>
        <button
          class="btn-primary hero-btn"
          @click="router.push('/cipher-types')"
        >
          开始破译
        </button>
      </div>
    </section>

    <!-- History sections -->
    <section
      v-for="sec in sections.slice(1)"
      :key="sec.key"
      :ref="(el) => setSectionRef(el, sec.key)"
      :data-section="sec.key"
      class="history-section"
      :class="{ 'section-visible': sec.visible }"
    >
      <div class="history-card">
        <div class="history-meta">
          <span class="history-era">{{ sec.era }}</span>
          <h2 class="history-title">{{ sec.title }}</h2>
        </div>
        <div class="history-body">
          <p v-for="(para, i) in sec.content.split('\n\n')" :key="i">
            {{ para }}
          </p>
        </div>
      </div>
    </section>

    <!-- Finale -->
    <section class="finale-section">
      <div class="finale-card">
        <div class="finale-rule"></div>
        <div class="finale-meta">献给所有密码破译者</div>
        <button
          class="btn-primary finale-btn"
          @click="router.push('/cipher-types')"
        >
          开始破译
        </button>
      </div>
    </section>

    <div class="end-sentinel"></div>

    <div class="scroll-hint" v-if="showHint">
      <span class="scroll-arrow">↓</span>
      <span class="scroll-label">向下滚动阅读历史</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const sections = ref([
  {
    key: "hero",
    visible: true,
    era: null,
    title: null,
    content: null,
  },
  {
    key: "qing-e",
    visible: false,
    era: "684 年 · 唐朝",
    title: '唐代"青鹅"拆字密信',
    content:
      '唐朝宰相裴炎与徐敬业、骆宾王密谋推翻武则天。裴炎派人送密信给徐敬业，信中仅写"青鹅"二字。旁人皆不解其意，武则天看到后拆字破解："青"拆为"十二月"，"鹅"拆为"我自与"（鹅的繁体"鵝"＝"我"+"鳥"），意为裴炎将在十二月在朝中内应起兵。武则天随即处死裴炎。',
  },
  {
    key: "kindi",
    visible: false,
    era: "公元 9 世纪 · 巴格达",
    title: "频率分析法的诞生",
    content:
      '阿拉伯博学家金迪（al-Kindi）在《关于解密加密信息的手稿》中首次系统描述了频率分析法——通过统计字母出现频率来破译替换密码。这是人类历史上第一次将统计学应用于密码破译，奠定了整个密码分析学的基础。\n\n金迪活跃于巴格达的"智慧宫"，一生著书近 290 部，涵盖哲学、数学、医学与音乐。他的密码学手稿曾被认为已经失传，直到 1987 年在伊斯坦布尔的苏莱曼尼亚档案馆被重新发现。',
  },
  {
    key: "charles-v",
    visible: false,
    era: "1547 年加密 · 2022–2024 年破译",
    title: "查理五世 500 年密信",
    content:
      '神圣罗马帝国皇帝查理五世在 1547 年写给法国大使的一封信使用了 120 种独特符号的复杂密码，五百年来无人能解。\n\n2022–2024 年，法国研究团队最终将其破译。关键突破是一位历史学家发现了一封已被部分解密的相关信件——相当于找到了破译的"罗塞塔石碑"。信中揭示了查理五世因害怕被暗杀而产生的恐惧。',
  },
  {
    key: "mary",
    visible: false,
    era: "1586 年 · 英格兰",
    title: "玛丽女王的密码",
    content:
      '苏格兰女王玛丽·斯图亚特被伊丽莎白一世软禁期间，使用一套包含数十种符号的复杂密码与外界通信。信件通过啤酒桶软木塞夹层秘密运送。英格兰情报首脑沃尔辛厄姆手下的密码专家菲利普斯成功破译了这套密码，并在玛丽批准刺杀伊丽莎白的回信末尾，用同一密码伪造了一段附言以套取全部同谋者姓名。\n\n这份证据直接导致玛丽被处决。菲利普斯在信封上画了一个绞刑架，史称"绞刑架信"，现存于大英图书馆。\n\n2023 年，国际密码专家组在法国国家图书馆发现并破译了此前被错误编目的 57 封玛丽密信，约五万词，发表在同行评审期刊 Cryptologia 上。',
  },
  {
    key: "zimmermann",
    visible: false,
    era: "1917 年 · 英国海军部 40 号房间",
    title: "齐默尔曼电报",
    content:
      '德国外交大臣齐默尔曼向墨西哥发出一封加密电报，提议德墨结盟对抗美国，许诺帮助墨西哥收复德克萨斯、新墨西哥和亚利桑那州。英国海军情报处 "40 号房间" 截获并破译了这封电报。密码专家奈杰尔·德·格雷曾在美国大使馆官员面前演示解密全过程以证明其真实性。\n\n1917 年 3 月 1 日，电报在美国报纸上公开发表。齐默尔曼本人随后公开确认了电报的真实性。一个多月后，美国对德宣战。',
  },
  {
    key: "adfgvx",
    visible: false,
    era: "1918 年 · 巴黎埃菲尔铁塔",
    title: 'ADFGVX 密码与"胜利电报"',
    content:
      "德军启用 ADFGVX 密码——使用六乘六棋盘加密字母与数字——号称不可破解。设在埃菲尔铁塔顶部的法军监听站截获了包含新密码字符的德军电报。法军密码专家潘万上尉连续二十六小时不眠不休，利用同一德军电台同时段发出的三份结构相似电报进行对比分析，于次日傍晚成功破译。\n\n明文内容是德军弹药补给的指令。福煦元帅据此判断出德军主攻方向，将最后预备队集中于此，成功击退了攻势——这是一战的转折点之一。潘万在破译后暴瘦十五公斤，住院数月。这段历史直至 1962 年才被解密公开。",
  },
  {
    key: "elizebeth",
    visible: false,
    era: "1920s–1940s · 美国",
    title: "伊丽莎白·弗里德曼",
    content:
      "伊丽莎白·史密斯·弗里德曼（Elizebeth Smith Friedman）是美国政府第一位女性密码破译者。\n\n禁酒令时期，她破译了 12,000 多条走私密信，在 30 多起联邦诉讼中出庭作证。二战期间，她的团队（海岸警卫队 387 小组）是西半球第一个破译恩尼格玛密码的团队。她破译的情报曾拯救了载有 8,000 多名士兵的 RMS 女王玛丽号邮轮，使其避开德国 U 艇的伏击。",
  },
  {
    key: "enigma",
    visible: false,
    era: "1932–1945 年 · 波兰与布莱切利园",
    title: "恩尼格玛密码机的破译",
    content:
      '德国恩尼格玛密码机通过机械齿轮与电路结合，产生天文数字级的排列组合，被德军视为不可攻破。1932 年，波兰数学家雷耶夫斯基、罗佐基和扎加尔斯基在从未见过机器的情况下重建了内部接线，首次破译了恩尼格玛。1939 年波兰即将被入侵前，他们将全部成果移交英国与法国。\n\n艾伦·图灵在布莱切利园设计了"炸弹机"，将每日密钥的搜索时间缩短到几小时。他亲自破解了德军 U 艇使用的海军恩尼格玛密码，保障了大西洋航运。破译所得情报（代号 Ultra）帮助盟军赢得了大西洋战役、在北非挫败隆美尔、并成功实施诺曼底登陆。历史学家估计布莱切利园的工作使二战至少缩短了两年。',
  },
]);

const sectionRefs = ref({});
const showHint = ref(true);

function setSectionRef(el, key) {
  if (el) {
    sectionRefs.value[key] = el;
  } else {
    delete sectionRefs.value[key];
  }
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const key = entry.target.dataset.section;
          const sec = sections.value.find((s) => s.key === key);
          if (sec) sec.visible = true;
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  Object.values(sectionRefs.value).forEach((el) => observer.observe(el));

  // 监听末尾哨兵，滚到底时隐藏滚动提示
  const hintObserver = new IntersectionObserver(
    ([entry]) => {
      showHint.value = !entry.isIntersecting;
    },
    { rootMargin: "0px 0px 10px 0px" }
  );

  const sentinel = document.querySelector(".end-sentinel");
  if (sentinel) hintObserver.observe(sentinel);
});
</script>



<style scoped>
.scroll-root {
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scroll-root::-webkit-scrollbar {
  display: none;
}

/* Hero */
.hero-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  max-width: 600px;
}

.hero-label {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-margin-red);
  font-weight: 700;
  border: 1.5px solid var(--color-margin-red);
  padding: 6px 20px;
  border-radius: 2px;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: 4.5rem;
  font-weight: 700;
  color: var(--color-ink-navy);
  line-height: 1.1;
  letter-spacing: 6px;
}

.hero-desc {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-graphite);
  line-height: 1.8;
}

.hero-btn {
  font-size: 1rem;
  padding: 14px 48px;
  margin-top: 12px;
}

/* History sections */
.history-section {
  padding: 100px 40px;
  max-width: 1100px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s cubic-bezier(0.215, 0.61, 0.355, 1),
    transform 1s cubic-bezier(0.215, 0.61, 0.355, 1);
}
.history-section.section-visible {
  opacity: 1;
  transform: translateY(0);
}

.history-card {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 60px;
  padding-top: 40px;
  border-top: 1.5px solid rgba(28, 42, 74, 0.2);
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-era {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-margin-red);
  font-weight: 700;
}

.history-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-ink-navy);
  line-height: 1.3;
}

.history-body {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--color-ink-navy);
}

.history-body p {
  margin-bottom: 24px;
  text-indent: 0;
  text-align: justify;
  opacity: 0.9;
}

.history-body p:last-child {
  margin-bottom: 0;
}

/* Finale */
.finale-section {
  padding: 120px 40px;
  text-align: center;
}

.finale-card {
  max-width: 600px;
  margin: 0 auto;
}

.finale-rule {
  width: 40px;
  height: 2px;
  background: var(--color-ink-navy);
  margin: 0 auto 24px;
}

.finale-meta {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-margin-red);
  font-weight: 700;
  margin-bottom: 12px;
}

.finale-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-ink-navy);
  line-height: 1.3;
  margin-bottom: 28px;
  letter-spacing: 2px;
}

.finale-text {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  line-height: 2;
  color: var(--color-ink-navy);
  margin-bottom: 40px;
  text-align: justify;
}

.finale-btn {
  font-size: 1rem;
  padding: 14px 48px;
}

/* Scroll hint */
.scroll-hint {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  animation: float-down 2.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.6s ease;
}

.scroll-arrow {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-graphite);
}

.scroll-label {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-graphite);
}

@keyframes float-down {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateX(-50%) translateY(8px);
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .history-card {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .history-section {
    padding: 60px 20px;
  }
  .hero-title {
    font-size: 3rem;
  }
}

.end-sentinel {
  height: 1px;
}
</style>
