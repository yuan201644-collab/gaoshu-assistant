import { describe, it, expect } from 'vitest'
import { normalizeMath, judgeAnswer } from '@/data/judge'
import { questionBank } from '@/data/questionBank'
import type { Question } from '@/types/question'

const choiceQ = questionBank.find((q) => q.id === 'c1-s1-001') as Question
const fillQ = questionBank.find((q) => q.id === 'c1-s1-002') as Question
const answerQ = questionBank.find((q) => q.id === 'c1-s1-003') as Question

describe('judgeAnswer — 选择题', () => {
  it('正确答案精确匹配', () => {
    expect(judgeAnswer(choiceQ, 'B')).toBe(true)
  })

  it('错误答案判 false', () => {
    expect(judgeAnswer(choiceQ, 'A')).toBe(false)
  })

  it('小写字母大小写敏感判 false', () => {
    expect(judgeAnswer(choiceQ, 'b')).toBe(false)
  })
})

describe('judgeAnswer — 填空题容错', () => {
  it('精确答案', () => {
    expect(judgeAnswer(fillQ, '$$\\frac{1}{\\sqrt{x}}$$')).toBe(true)
  })

  it('首尾空格容错', () => {
    expect(judgeAnswer(fillQ, '   $$\\frac{1}{\\sqrt{x}}$$   ')).toBe(true)
  })

  it('大小写不敏感（X → x）', () => {
    expect(judgeAnswer(fillQ, '$$\\frac{1}{\\sqrt{X}}$$')).toBe(true)
  })

  it('去 $$ 与 LaTeX 等价（1/sqrt(x)）', () => {
    expect(judgeAnswer(fillQ, '1/sqrt(x)')).toBe(true)
  })

  it('数值语义不等价（文档化限制）：0.5 ≠ 1/2', () => {
    const q = questionBank.find((x) => x.id === 'c1-s2-002') as Question
    expect(judgeAnswer(q, '0.5')).toBe(false)
    expect(judgeAnswer(q, '$$\\frac{1}{2}$$')).toBe(true)
    expect(judgeAnswer(q, '1/2')).toBe(true)
  })
})

describe('judgeAnswer — 解答题', () => {
  it('不自动判分恒 false', () => {
    expect(judgeAnswer(answerQ, '奇函数')).toBe(false)
  })
})

describe('normalizeMath — 符号归一', () => {
  it('± 类符号 → pm', () => {
    expect(normalizeMath('±')).toBe('pm')
    expect(normalizeMath('+/-')).toBe('pm')
    expect(normalizeMath('+-')).toBe('pm')
  })

  it('π 类符号 → pi', () => {
    expect(normalizeMath('π')).toBe('pi')
    expect(normalizeMath('Π')).toBe('pi')
    expect(normalizeMath('pi')).toBe('pi')
    expect(normalizeMath('∏')).toBe('pi')
  })

  it('× → *', () => {
    expect(normalizeMath('a×b')).toBe('a*b')
  })
})

describe('normalizeMath — LaTeX 归一', () => {
  it('frac / sqrt / 去 $$', () => {
    expect(normalizeMath('\\frac{1}{2}')).toBe('1/2')
    expect(normalizeMath('\\frac{1}{\\sqrt{x}}')).toBe('1/sqrt(x)')
    expect(normalizeMath('$$\\frac{1}{2}$$')).toBe('1/2')
  })

  it('全角转半角 + 去空白', () => {
    expect(normalizeMath(' （1＋2） ')).toBe('(1+2)')
  })
})
