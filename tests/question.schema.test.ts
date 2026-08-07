import { describe, it, expect } from 'vitest'
import { validateQuestion, validateBank, parseQuestionId } from '@/data/validate'
import type { Question } from '@/types/question'

function validQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'c1-s1-001',
    chapter: '第一章 函数、极限、连续',
    section: '1.1 函数',
    tags: ['函数概念'],
    type: 'choice',
    difficulty: 1,
    source: '基础篇例题',
    question: '函数 $$f(x) = \\frac{1}{x}$$ 的定义域是？',
    options: ['A. x ≠ 0', 'B. x > 0'],
    answer: 'A',
    analysis: '分母不为零',
    ...overrides,
  }
}

describe('validateQuestion', () => {
  it('合法题目返回空错误数组', () => {
    expect(validateQuestion(validQuestion())).toEqual([])
  })

  it('非法 id 被拒绝', () => {
    const q = validQuestion({ id: '1-1-001' })
    expect(validateQuestion(q).join()).toContain('id')
  })

  it('选择题缺少选项被拒绝', () => {
    const q = validQuestion({ type: 'choice', options: undefined })
    expect(validateQuestion(q).join()).toContain('选项')
  })

  it('非法题型被拒绝', () => {
    const q = validQuestion({ type: 'essay' as Question['type'] })
    expect(validateQuestion(q).join()).toContain('type')
  })

  it('难度超出 1-3 被拒绝', () => {
    const q = validQuestion({ difficulty: 5 as Question['difficulty'] })
    expect(validateQuestion(q).join()).toContain('difficulty')
  })
})

describe('validateBank', () => {
  it('检测重复 id', () => {
    const q1 = validQuestion()
    const q2 = validQuestion()
    const result = validateBank([q1, q2])
    expect(result['c1-s1-001'].join()).toContain('重复')
  })

  it('合法题库返回空映射', () => {
    const q1 = validQuestion()
    const q2 = validQuestion({ id: 'c1-s1-002' })
    expect(validateBank([q1, q2])).toEqual({})
  })
})

describe('parseQuestionId', () => {
  it('正确解析章与节', () => {
    expect(parseQuestionId('c3-s2-015')).toEqual({ chapter: 3, section: 2 })
  })

  it('非法 id 返回 null', () => {
    expect(parseQuestionId('bad-id')).toBeNull()
  })
})
