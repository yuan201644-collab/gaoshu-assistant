<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapters } from '@/data/chapters'
import { questionBank } from '@/data/questionBank'
import { parseQuestionId } from '@/data/validate'

const route = useRoute()
const router = useRouter()

const cid = String(route.params.cid)
const sid = String(route.params.sid)

const chapter = computed(() => chapters.find((c) => c.id === cid))
const section = computed(() => chapter.value?.sections.find((s) => s.id === sid))
const chapterNo = computed(() => chapter.value?.title.split(' ')[0] ?? '')
const sectionTitle = computed(() => section.value?.title ?? '')
const questionCount = computed(
  () =>
    questionBank.filter((q) => {
      const key = parseQuestionId(q.id)
      return key && key.chapter === Number(cid.slice(1)) && key.section === Number(sid.slice(1))
    }).length,
)
</script>

<template>
  <div class="page-full">
    <header class="practice-top">
      <button class="back-btn" @click="router.back()">‹ 返回</button>
      <span class="practice-title">刷题</span>
    </header>

    <div class="card">
      <div class="card-title">{{ chapterNo }} · {{ sectionTitle }} · 共 {{ questionCount }} 题</div>
      <p class="placeholder">题干 · 选项 / 填空 / 解答 · 答案解析 · AI 讲解（下一轮实现）</p>
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
}

.placeholder {
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
