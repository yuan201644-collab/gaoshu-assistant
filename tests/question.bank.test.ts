import { describe, it, expect } from 'vitest'
import { validateBank, parseQuestionId } from '@/data/validate'
import { questionBank } from '@/data/questionBank'
import { chapters } from '@/data/chapters'

describe('questionBank 数据层', () => {
  it('整库通过 validateBank() 校验（零错误）', () => {
    expect(validateBank(questionBank)).toEqual({})
  })

  it('覆盖第一章至少 2 个节', () => {
    const sections = new Set(questionBank.map((q) => parseQuestionId(q.id)?.section))
    expect(sections.size).toBeGreaterThanOrEqual(2)
  })

  it('每个被覆盖的节题目数为 3-5', () => {
    const counts = new Map<number, number>()
    for (const q of questionBank) {
      const key = parseQuestionId(q.id)
      if (!key) continue
      counts.set(key.section, (counts.get(key.section) ?? 0) + 1)
    }
    for (const [section, count] of counts) {
      expect(count, `section s${section} 应有 3-5 题，实际 ${count}`).toBeGreaterThanOrEqual(3)
      expect(count, `section s${section} 应有 3-5 题，实际 ${count}`).toBeLessThanOrEqual(5)
    }
  })

  it('三题型混合（choice / fill / answer 均存在）', () => {
    const types = new Set(questionBank.map((q) => q.type))
    expect(types).toEqual(new Set(['choice', 'fill', 'answer']))
  })

  it('题目的章/节与 chapters.ts 结构一致', () => {
    const c1 = chapters.find((c) => c.id === 'c1')
    expect(c1).toBeDefined()
    const sectionTitleById = new Map(c1!.sections.map((s) => [s.id, s.title]))
    for (const q of questionBank) {
      const key = parseQuestionId(q.id)
      expect(key).not.toBeNull()
      const sectionId = `s${key!.section}`
      expect(sectionTitleById.has(sectionId), `题目 ${q.id} 引用了不存在的节 ${sectionId}`).toBe(true)
      expect(q.section, `题目 ${q.id} 的 section 应等于章节页标题`).toBe(sectionTitleById.get(sectionId))
      expect(q.chapter).toBe(c1!.title)
    }
  })
})
