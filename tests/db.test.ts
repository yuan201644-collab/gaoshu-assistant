import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import {
  initDb,
  recordAnswer,
  addToWrongBook,
  getWrongBook,
  getProgress,
  deriveSectionState,
} from '@/db/db'

const DB_NAME = 'gaoshu_db'

/** 清空数据库：每次用例前保证干净环境 */
async function resetDb(): Promise<void> {
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })
}

beforeEach(async () => {
  await resetDb()
})

describe('db.ts — 基础写入', () => {
  it('initDb 幂等可重复调用', async () => {
    await initDb()
    await initDb()
    expect(true).toBe(true)
  })

  it('recordAnswer 答错写入 study_record 与 wrong_book', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    const wrong = await getWrongBook()
    expect(wrong).toHaveLength(1)
    expect(wrong[0].questionId).toBe('c1-s1-001')
    expect(wrong[0].wrongCount).toBe(1)
    expect(wrong[0].wrongType).toBe('choice')
  })
})

describe('db.ts — 错题去重累加与移除', () => {
  it('同一题连错 2 次：wrongCount 累加为 2，错题列表仅 1 条', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    await recordAnswer('c1-s1-001', false, 'B')
    const wrong = await getWrongBook()
    expect(wrong).toHaveLength(1)
    expect(wrong[0].wrongCount).toBe(2)
  })

  it('答对后移出错题本', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    await recordAnswer('c1-s1-001', true, 'B')
    const wrong = await getWrongBook()
    expect(wrong).toHaveLength(0)
  })

  it('addToWrongBook 手动标记累加', async () => {
    await addToWrongBook('c1-s1-003', 'answer')
    await addToWrongBook('c1-s1-003', 'answer')
    const wrong = await getWrongBook()
    expect(wrong).toHaveLength(1)
    expect(wrong[0].wrongCount).toBe(2)
    expect(wrong[0].wrongType).toBe('answer')
  })
})

describe('db.ts — 节进度聚合', () => {
  it('多题作答后 doneCount / wrongCount 正确', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    await recordAnswer('c1-s1-002', true, 'x')
    const p = await getProgress('c1', 's1')
    expect(p.doneCount).toBe(2)
    expect(p.wrongCount).toBe(1)
    expect(p.lastTs).toBeGreaterThan(0)
  })

  it('同一题多次作答 doneCount 去重', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    await recordAnswer('c1-s1-001', false, 'B')
    const p = await getProgress('c1', 's1')
    expect(p.doneCount).toBe(1)
  })

  it('答对后该节错题数下降，已做题数不变', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    await recordAnswer('c1-s1-002', false, 'x')
    expect((await getProgress('c1', 's1')).wrongCount).toBe(2)
    await recordAnswer('c1-s1-001', true, 'B')
    expect((await getProgress('c1', 's1')).wrongCount).toBe(1)
    expect((await getProgress('c1', 's1')).doneCount).toBe(2)
  })

  it('节之间互不影响', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    await recordAnswer('c1-s2-001', false, 'A')
    expect((await getProgress('c1', 's1')).doneCount).toBe(1)
    expect((await getProgress('c1', 's2')).doneCount).toBe(1)
  })

  it('未作答节返回全 0', async () => {
    const p = await getProgress('c1', 's3')
    expect(p).toEqual({ doneCount: 0, wrongCount: 0, lastTs: 0 })
  })
})

describe('db.ts — 错题列表排序', () => {
  it('getWrongBook 按 lastWrongTs 降序', async () => {
    await recordAnswer('c1-s1-001', false, 'A')
    await recordAnswer('c1-s2-001', false, 'A')
    await recordAnswer('c1-s1-002', false, 'x')
    const wrong = await getWrongBook()
    expect(wrong).toHaveLength(3)
    const ts = wrong.map((w) => w.lastWrongTs)
    expect(ts).toEqual([...ts].sort((a, b) => b - a))
  })
})

describe('db.ts — P2 回归：解答题自评驱动节完成', () => {
  it('整节含解答题且全部自评通过 → doneCount===total → 已完成', async () => {
    await recordAnswer('c1-s1-001', true, 'B') // 选择题答对
    await recordAnswer('c1-s1-002', true, '$$\\frac{1}{\\sqrt{x}}$$') // 填空题答对
    await recordAnswer('c1-s1-003', true, 'self:correct') // 解答题自评答对
    const p = await getProgress('c1', 's1')
    expect(p.doneCount).toBe(3) // c1-s1 共 3 题
    expect(p.wrongCount).toBe(0)
    expect(deriveSectionState(p.doneCount, p.wrongCount, 3)).toBe('done')
  })

  it('解答题自评答错 → wrong_book 自动入库且 wrongType=answer', async () => {
    await recordAnswer('c1-s1-003', false, 'self:wrong')
    const wrong = await getWrongBook()
    expect(wrong).toHaveLength(1)
    expect(wrong[0].questionId).toBe('c1-s1-003')
    expect(wrong[0].wrongCount).toBe(1)
    expect(wrong[0].wrongType).toBe('answer')
  })

  it('解答题自评答对后，先前错题记录被移出错题本', async () => {
    await recordAnswer('c1-s1-003', false, 'self:wrong')
    await recordAnswer('c1-s1-003', true, 'self:correct')
    expect(await getWrongBook()).toHaveLength(0)
  })
})

describe('db.ts — 无 IndexedDB 降级', () => {
  it('降级后各函数不抛错、返回空/0', async () => {
    vi.stubGlobal('indexedDB', undefined)
    await expect(initDb()).resolves.toBeUndefined()
    await expect(recordAnswer('c1-s1-001', false, 'A')).resolves.toBeUndefined()
    await expect(addToWrongBook('c1-s1-001', 'choice')).resolves.toBeUndefined()
    await expect(getWrongBook()).resolves.toEqual([])
    await expect(getProgress('c1', 's1')).resolves.toEqual({ doneCount: 0, wrongCount: 0, lastTs: 0 })
    vi.unstubAllGlobals()
  })
})

describe('deriveSectionState — 章节三色判定', () => {
  it('未学习：0 题做过', () => {
    expect(deriveSectionState(0, 0, 4)).toBe('todo')
    expect(deriveSectionState(0, 1, 4)).toBe('todo')
  })

  it('学习中：做过未全对或仍有错', () => {
    expect(deriveSectionState(2, 0, 4)).toBe('doing')
    expect(deriveSectionState(4, 1, 4)).toBe('doing')
  })

  it('已完成：全做过且全对', () => {
    expect(deriveSectionState(4, 0, 4)).toBe('done')
  })

  it('空节（0 题）为未学习', () => {
    expect(deriveSectionState(0, 0, 0)).toBe('todo')
  })
})
