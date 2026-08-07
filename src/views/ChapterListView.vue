<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { chapters } from '@/data/chapters'
import { questionsOf } from '@/data/bank'
import { getProgress, deriveSectionState } from '@/db/db'

const router = useRouter()

// 记录已展开的章 id，默认全部展开
const openChapters = ref<Set<string>>(new Set(chapters.map((c) => c.id)))

// 各节进度缓存，未加载完默认显示「已做 0 · 错 0」
const progressMap = reactive<
  Record<string, { doneCount: number; wrongCount: number; lastTs: number }>
>({})

onMounted(async () => {
  const pairs: Array<[string, string]> = []
  for (const c of chapters) {
    for (const s of c.sections) {
      pairs.push([c.id, s.id])
    }
  }
  const results = await Promise.all(pairs.map(([cid, sid]) => getProgress(cid, sid)))
  pairs.forEach(([cid, sid], i) => {
    progressMap[`${cid}-${sid}`] = results[i]
  })
})

function toggleChapter(id: string) {
  const next = new Set(openChapters.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openChapters.value = next
}

function countOf(chapterId: string, sectionId: string): number {
  const ch = chapters.find((c) => c.id === chapterId)
  const sec = ch?.sections.find((s) => s.id === sectionId)
  if (!ch || !sec) return 0
  return questionsOf(ch.title, sec.title).length
}

function progressOf(chapterId: string, sectionId: string) {
  return progressMap[`${chapterId}-${sectionId}`] ?? { doneCount: 0, wrongCount: 0, lastTs: 0 }
}

function sectionState(chapterId: string, sectionId: string) {
  const { doneCount, wrongCount } = progressOf(chapterId, sectionId)
  return deriveSectionState(doneCount, wrongCount, countOf(chapterId, sectionId))
}

function stateColor(chapterId: string, sectionId: string): string {
  const st = sectionState(chapterId, sectionId)
  return st === 'done' ? 'var(--state-done)' : st === 'doing' ? 'var(--state-doing)' : 'var(--state-todo)'
}

function stateLabel(chapterId: string, sectionId: string): string {
  const st = sectionState(chapterId, sectionId)
  return st === 'done' ? '已完成' : st === 'doing' ? '学习中' : '未学习'
}

function goPractice(chapterId: string, sectionId: string) {
  router.push(`/practice/${chapterId}/${sectionId}`)
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">章节列表</h1>
    <p class="page-sub">高数 · 基础篇（开发中）</p>

    <div v-for="chapter in chapters" :key="chapter.id" class="chapter">
      <button class="chapter-head" @click="toggleChapter(chapter.id)">
        <span class="chapter-title">{{ chapter.title }}</span>
        <span class="chapter-caret" :class="{ 'is-open': openChapters.has(chapter.id) }">›</span>
      </button>

      <ul v-if="openChapters.has(chapter.id)" class="section-list">
        <li
          v-for="section in chapter.sections"
          :key="section.id"
          class="section-item"
          @click="goPractice(chapter.id, section.id)"
        >
          <div class="section-main">
            <span class="section-title">{{ section.title }}</span>
            <span class="section-stats">
              共 {{ countOf(chapter.id, section.id) }} 题 · 已做 {{ progressOf(chapter.id, section.id).doneCount }} · 错 {{ progressOf(chapter.id, section.id).wrongCount }}
            </span>
          </div>
          <span class="section-state">
            <span class="dot" :style="{ background: stateColor(chapter.id, section.id) }"></span>
            {{ stateLabel(chapter.id, section.id) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.chapter {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
  overflow: hidden;
}

.chapter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  transition: background 0.2s ease;
}

.chapter-head:active {
  background: var(--color-primary-soft);
}

.chapter-title {
  font-size: var(--text-title);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.chapter-caret {
  color: var(--color-text-subtle);
  transition: transform 0.15s ease;
}

.chapter-caret.is-open {
  transform: rotate(90deg);
}

.section-list {
  list-style: none;
}

.section-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s ease;
}

.section-item:active {
  background: var(--color-primary-soft);
}

@media (hover: hover) {
  .section-item:hover {
    background: var(--color-primary-soft);
  }
}

.section-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title {
  font-size: 15px;
}

.section-stats {
  font-size: 12px;
  color: var(--color-text-muted);
}

.section-state {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-subtle);
  white-space: nowrap;
}
</style>
