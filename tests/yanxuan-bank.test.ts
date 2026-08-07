import { describe, it, expect } from 'vitest'
import { validateBank } from '@/data/validate'
import { yanxuanChapter1 } from '@/data/yanxuanBank'
import { chapters } from '@/data/chapters'

describe('yanxuanBank 严选题库（题图模式）', () => {
  it('整库通过 validateBank() 校验（题图题跳过答案/解析）', () => {
    expect(validateBank(yanxuanChapter1)).toEqual({})
  })

  it('共 36 题，三题型混合', () => {
    expect(yanxuanChapter1.length).toBe(36)
    const types = new Set(yanxuanChapter1.map((q) => q.type))
    expect(types).toEqual(new Set(['choice', 'fill', 'answer']))
  })

  it('题目归属的节全部存在于 chapters.ts 且覆盖 8 个知识点节', () => {
    const c1 = chapters.find((c) => c.id === 'c1')
    const allTitles = new Set(c1!.sections.map((s) => s.title))
    const covered = new Set(yanxuanChapter1.map((q) => q.section))
    for (const s of covered) {
      expect(allTitles.has(s), `知识点 "${s}" 不在章节结构中`).toBe(true)
    }
    expect(covered.size).toBe(8)
  })

  it('每题均有合法的单题图路径且与 id 对应', () => {
    for (const q of yanxuanChapter1) {
      // id 形如 c1-x01 → 单题图 /bank/ch1/qx01.png
      const suffix = q.id.replace(/^c1-/, '')
      expect(q.image, `题目 ${q.id} 缺题图`).toBe(`/bank/ch1/q${suffix}.png`)
    }
  })

  it('每题带原书题号且来源为严选题', () => {
    for (const q of yanxuanChapter1) {
      expect(q.number, `题目 ${q.id} 缺题号`).toBeTruthy()
      expect(q.source).toBe('严选题')
    }
  })
})
