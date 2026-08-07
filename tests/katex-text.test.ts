// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KatexText from '@/components/KatexText.vue'

describe('KatexText', () => {
  it('含 $$...$$ 块级公式渲染出 .katex 元素', () => {
    const wrapper = mount(KatexText, { props: { text: '公式 $$x^2$$ 结束' } })
    expect(wrapper.findAll('.katex').length).toBeGreaterThan(0)
  })

  it('含 $...$ 内联公式也渲染', () => {
    const wrapper = mount(KatexText, { props: { text: '值 $x+1$ 结束' } })
    expect(wrapper.findAll('.katex').length).toBeGreaterThan(0)
  })

  it('含 \\[...\\] 块级公式（AI 常用格式）也渲染', () => {
    const wrapper = mount(KatexText, { props: { text: '区间 \\[ (1, 2] \\] 结束' } })
    expect(wrapper.findAll('.katex').length).toBeGreaterThan(0)
  })

  it('无公式文本不渲染 .katex，保留原文', () => {
    const wrapper = mount(KatexText, { props: { text: '纯文本，没有公式' } })
    expect(wrapper.findAll('.katex').length).toBe(0)
    expect(wrapper.text()).toContain('纯文本，没有公式')
  })

  it('非法公式不崩溃', () => {
    const wrapper = mount(KatexText, { props: { text: '$$\frac{1}{$}$$ 异常输入' } })
    expect(wrapper.exists()).toBe(true)
  })
})
