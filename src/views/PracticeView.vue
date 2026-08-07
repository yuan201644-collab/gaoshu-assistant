<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapters } from '@/data/chapters'
import { questionBank } from '@/data/questionBank'
import { parseQuestionId } from '@/data/validate'
import { judgeAnswer } from '@/data/judge'
import { initDb, recordAnswer, addToWrongBook } from '@/db/db'
import KatexText from '@/components/KatexText.vue'
import type { Question } from '@/types/question'

const route = useRoute()
const router = useRouter()

const cid = String(route.params.cid)
const sid = String(route.params.sid)

const chapter = computed(() => chapters.find((c) => c.id === cid))
const sectionTitle = computed(() => chapter.value?.sections.find((s) => s.id === sid)?.title ?? '')

const queue = computed(() =>
  questionBank.filter((q) => {
    const key = parseQuestionId(q.id)
    return key && `c${key.chapter}` === cid && `s${key.section}` === sid
  }),
)

const currentIndex = ref(0)
const current = computed<Question | undefined>(() => queue.value[currentIndex.value])

const states = reactive<Record<string, 'pending' | 'submitted'>>({})
const results = reactive<Record<string, { correct: boolean; userAnswer: string }>>({})
/** 解答题已自评标记，键为 questionId；区分「已查看答案未自评」与「已自评」 */
const selfAssessed = reactive<Record<string, boolean>>({})
const fillInput = ref('')

// 收藏：localStorage 持久化，非本轮 IndexedDB 重点
const FAV_KEY = 'gaoshu:favorites'
const favorites = ref<Set<string>>(new Set())

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    favorites.value = new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    favorites.value = new Set()
  }
}

function toggleFavorite(id: string) {
  const next = new Set(favorites.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  favorites.value = next
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...next]))
  } catch {
    /* localStorage 不可用时静默忽略 */
  }
}

onMounted(async () => {
  await initDb()
  loadFavorites()
})

watch(
  () => current.value?.id,
  (qid) => {
    fillInput.value = qid ? (results[qid]?.userAnswer ?? '') : ''
  },
)

/** 选项文本 → 选项序号字母，如 "A. $$...$$" → "A" */
function letterOf(opt: string): string {
  const m = /^([A-Da-d])\s*[.)、]/.exec(opt.trim())
  return m ? m[1].toUpperCase() : opt.trim().charAt(0).toUpperCase()
}

function submitAnswer(q: Question, userAnswer: string) {
  if (states[q.id] === 'submitted') return
  const correct = judgeAnswer(q, userAnswer)
  states[q.id] = 'submitted'
  results[q.id] = { correct, userAnswer }
  void recordAnswer(q.id, correct, userAnswer)
}

function chooseOption(q: Question, opt: string) {
  if (states[q.id] === 'submitted') return
  submitAnswer(q, letterOf(opt))
}

function submitFill(q: Question) {
  if (states[q.id] === 'submitted') return
  submitAnswer(q, fillInput.value)
}

/** 解答题不自动判分：查看答案即标记 submitted、展开解析 */
function viewAnswer(q: Question) {
  if (states[q.id] === 'submitted') return
  states[q.id] = 'submitted'
  results[q.id] = { correct: false, userAnswer: '' }
}

/** 解答题自评：写 study_record 驱动进度与错题本（答错经 recordAnswer 自动入错题本） */
function selfAssess(q: Question, correct: boolean) {
  if (states[q.id] !== 'submitted' || selfAssessed[q.id]) return
  selfAssessed[q.id] = true
  const userAnswer = correct ? 'self:correct' : 'self:wrong'
  results[q.id] = { correct, userAnswer }
  void recordAnswer(q.id, correct, userAnswer)
}

function markWrong(q: Question) {
  void addToWrongBook(q.id, q.type)
}

function goPrev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function goNext() {
  const last = currentIndex.value === queue.value.length - 1
  const q = queue.value[currentIndex.value]
  if (last && q && states[q.id] !== 'submitted') return
  if (!last) currentIndex.value++
  else router.push('/chapters')
}

function typeLabel(q: Question): string {
  return q.type === 'choice' ? '选择题' : q.type === 'fill' ? '填空题' : '解答题'
}

function optionClass(q: Question, opt: string): Record<string, boolean> {
  if (states[q.id] !== 'submitted') return {}
  const letter = letterOf(opt)
  const chosen = results[q.id]?.userAnswer
  return {
    'is-correct': letter === q.answer,
    'is-wrong': letter === chosen && letter !== q.answer,
  }
}

function feedbackText(q: Question): string {
  if (q.type === 'answer') {
    if (selfAssessed[q.id]) return results[q.id]?.correct ? '自评正确' : '自评错误'
    return '已查看答案，请自行核对'
  }
  return results[q.id]?.correct ? '回答正确' : '回答错误'
}

function feedbackClass(q: Question): string {
  if (q.type === 'answer') {
    if (selfAssessed[q.id]) return results[q.id]?.correct ? 'is-correct' : 'is-wrong'
    return 'is-neutral'
  }
  return results[q.id]?.correct ? 'is-correct' : 'is-wrong'
}
</script>

<template>
  <div class="page-full">
    <header class="practice-top">
      <button class="back-btn" @click="router.back()">‹ 返回</button>
      <span class="practice-title">
        {{ queue.length > 0 ? `第 ${currentIndex + 1} / ${queue.length} 题` : '刷题' }}
      </span>
      <button
        v-if="current"
        class="fav-btn"
        :class="{ 'is-fav': favorites.has(current.id) }"
        aria-label="收藏"
        @click="toggleFavorite(current.id)"
      >
        {{ favorites.has(current.id) ? '★' : '☆' }}
      </button>
    </header>

    <template v-if="current">
      <div class="card">
        <div class="card-title">
          <span class="type-tag">{{ typeLabel(current) }}</span>
          <span class="section-sub">{{ sectionTitle }}</span>
        </div>

        <div class="question-text">
          <KatexText :text="current.question" />
        </div>

        <!-- 选择题 -->
        <div v-if="current.type === 'choice'" class="option-list">
          <button
            v-for="opt in current.options ?? []"
            :key="opt"
            class="option-item"
            :class="optionClass(current, opt)"
            :disabled="states[current.id] === 'submitted'"
            @click="chooseOption(current, opt)"
          >
            <KatexText :text="opt" />
          </button>
        </div>

        <!-- 填空题 -->
        <div v-else-if="current.type === 'fill'" class="fill-area">
          <input
            v-model="fillInput"
            class="fill-input"
            :disabled="states[current.id] === 'submitted'"
            placeholder="输入答案"
            @keyup.enter="submitFill(current)"
          />
          <button
            v-if="states[current.id] !== 'submitted'"
            class="btn btn-primary"
            @click="submitFill(current)"
          >
            提交
          </button>
        </div>

        <!-- 解答题 -->
        <div v-else class="answer-area">
          <button
            v-if="states[current.id] !== 'submitted'"
            class="btn btn-primary"
            @click="viewAnswer(current)"
          >
            查看答案
          </button>
          <div v-else-if="!selfAssessed[current.id]" class="self-assess">
            <button class="btn btn-success" @click="selfAssess(current, true)">答对了</button>
            <button class="btn btn-danger" @click="selfAssess(current, false)">答错了</button>
          </div>
        </div>

        <!-- 作答结果 -->
        <div
          v-if="states[current.id] === 'submitted'"
          class="result-feedback"
          :class="feedbackClass(current)"
        >
          {{ feedbackText(current) }}
        </div>

        <!-- 解析区：提交后展开 -->
        <div v-if="states[current.id] === 'submitted'" class="analysis">
          <div class="analysis-title">答案解析</div>
          <div class="analysis-body">
            <KatexText :text="current.analysis" />
          </div>
        </div>
      </div>

      <!-- 底部操作条 -->
      <div class="practice-bottom">
        <button class="btn btn-ghost" :disabled="currentIndex === 0" @click="goPrev">上一题</button>
        <button
          v-if="states[current.id] !== 'submitted'"
          class="btn btn-ghost"
          @click="markWrong(current)"
        >
          标记错题
        </button>
        <button
          class="btn btn-primary"
          :disabled="currentIndex === queue.length - 1 && states[current.id] !== 'submitted'"
          @click="goNext"
        >
          {{ currentIndex === queue.length - 1 ? '完成' : '下一题' }}
        </button>
      </div>
    </template>

    <div v-else class="card">
      <p class="placeholder">该节暂无题目</p>
    </div>
  </div>
</template>

<style scoped>
.practice-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.back-btn {
  color: var(--color-primary);
  font-size: 15px;
  padding: 8px 4px;
}

.practice-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
}

.fav-btn {
  font-size: 20px;
  color: var(--color-text-subtle);
  padding: 8px;
}

.fav-btn.is-fav {
  color: var(--color-warning);
}

.section-sub {
  font-size: 13px;
  color: var(--color-text-muted);
}

.type-tag {
  font-size: 13px;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 2px 8px;
  border-radius: 6px;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 16px;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.option-item {
  display: block;
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 15px;
  line-height: 1.6;
  -webkit-tap-highlight-color: transparent;
}

.option-item:active {
  background: var(--color-primary-soft);
}

.option-item.is-correct {
  border-color: var(--color-success);
  background: rgba(52, 168, 83, 0.08);
}

.option-item.is-wrong {
  border-color: var(--color-danger);
  background: rgba(229, 72, 77, 0.08);
}

.option-item:disabled {
  cursor: default;
}

.fill-area {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.fill-input {
  flex: 1;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--color-surface);
}

.fill-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.answer-area {
  margin-bottom: 16px;
}

.self-assess {
  display: flex;
  gap: 10px;
}

.self-assess .btn {
  flex: 1;
}

.result-feedback {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.result-feedback.is-correct {
  background: rgba(52, 168, 83, 0.1);
  color: var(--color-success);
}

.result-feedback.is-wrong {
  background: rgba(229, 72, 77, 0.1);
  color: var(--color-danger);
}

.result-feedback.is-neutral {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.analysis {
  border-top: 1px dashed var(--color-border);
  padding-top: 12px;
}

.analysis-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.analysis-body {
  font-size: 14px;
  line-height: 1.7;
}

.practice-bottom {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.practice-bottom .btn {
  flex: 1;
}

.placeholder {
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
