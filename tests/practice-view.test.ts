// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const routerMock = vi.hoisted(() => ({ back: vi.fn(), push: vi.fn() }))
const dbMock = vi.hoisted(() => ({
  initDb: vi.fn().mockResolvedValue(undefined),
  recordAnswer: vi.fn().mockResolvedValue(undefined),
  addToWrongBook: vi.fn().mockResolvedValue(undefined),
}))
const aiMock = vi.hoisted(() => ({ buildExplainPrompt: vi.fn(() => 'context-text') }))
const aiChatMock = vi.hoisted(() => ({ openWithContext: vi.fn() }))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { cid: 'c1', sid: 's1' } }),
  useRouter: () => routerMock,
}))

vi.mock('@/db/db', () => dbMock)

vi.mock('@/services/ai', () => aiMock)
vi.mock('@/services/aiChat', () => aiChatMock)

import PracticeView from '@/views/PracticeView.vue'
import { recordAnswer, addToWrongBook } from '@/db/db'
import { openWithContext } from '@/services/aiChat'
import { buildExplainPrompt } from '@/services/ai'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

/** 底部操作条按钮按文本查找（按钮含：上一题/标记错题/AI 讲解/下一题/完成） */
function btnByText(wrapper: ReturnType<typeof mount>, text: string) {
  const btn = wrapper.findAll('.practice-bottom button').find((b) => b.text() === text)
  if (!btn) throw new Error(`未找到底部按钮：${text}`)
  return btn
}

describe('PracticeView — c1-s1 选择题', () => {
  it('点击正确选项即提交判分，解析展开', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()
    expect(wrapper.text()).toContain('第 1 / 4 题')

    const options = wrapper.findAll('.option-item')
    expect(options).toHaveLength(4)
    await options[1].trigger('click') // B（正确答案）
    await flushPromises()

    expect(wrapper.find('.analysis').exists()).toBe(true)
    expect(wrapper.find('.result-feedback').text()).toContain('回答正确')
    expect(recordAnswer).toHaveBeenCalledWith('c1-s1-001', true, 'B')
  })

  it('点击错误选项记录错题（correct=false）', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()

    const options = wrapper.findAll('.option-item')
    await options[0].trigger('click') // A，正确答案为 B
    await flushPromises()

    expect(wrapper.find('.result-feedback').text()).toContain('回答错误')
    expect(recordAnswer).toHaveBeenCalledWith('c1-s1-001', false, 'A')
  })

  it('提交后选项禁用不可重复提交', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()

    const options = wrapper.findAll('.option-item')
    await options[1].trigger('click')
    await flushPromises()

    expect(recordAnswer).toHaveBeenCalledTimes(1)
    await options[0].trigger('click')
    await flushPromises()
    expect(recordAnswer).toHaveBeenCalledTimes(1)
  })

  it('自动判分提交后「标记错题」按钮隐藏（避免重复计数）', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()

    await wrapper.findAll('.option-item')[1].trigger('click') // B 正确
    await flushPromises()

    const texts = wrapper.findAll('.practice-bottom button').map((b) => b.text())
    expect(texts).not.toContain('标记错题')
  })
})

describe('PracticeView — c1-s1 填空题', () => {
  it('输入答案提交判分', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()

    await btnByText(wrapper, '下一题').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('第 2 / 4 题')

    await wrapper.find('.fill-input').setValue('$$\\frac{1}{\\sqrt{x}}$$')
    await wrapper.find('.fill-area .btn-primary').trigger('click')
    await flushPromises()

    expect(wrapper.find('.analysis').exists()).toBe(true)
    expect(wrapper.find('.result-feedback').text()).toContain('回答正确')
    expect(recordAnswer).toHaveBeenCalledWith('c1-s1-002', true, '$$\\frac{1}{\\sqrt{x}}$$')
  })
})

describe('PracticeView — c1-s1 解答题自评', () => {
  async function toAnswerQuestion(wrapper: ReturnType<typeof mount>) {
    const next = btnByText(wrapper, '下一题')
    await next.trigger('click')
    await flushPromises()
    await next.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('第 3 / 4 题')
  }

  it('查看答案展开解析，未自评前不写 study_record', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()
    await toAnswerQuestion(wrapper)

    await wrapper.find('.answer-area .btn-primary').trigger('click') // 查看答案
    await flushPromises()

    expect(wrapper.find('.analysis').exists()).toBe(true)
    expect(wrapper.find('.result-feedback').text()).toContain('已查看答案')
    expect(wrapper.find('.self-assess').exists()).toBe(true)
    expect(recordAnswer).not.toHaveBeenCalled()
  })

  it('自评「答对了」写 study_record(self:correct)，按钮消失解析保持展开', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()
    await toAnswerQuestion(wrapper)

    await wrapper.find('.answer-area .btn-primary').trigger('click')
    await flushPromises()
    await wrapper.find('.self-assess .btn-success').trigger('click') // 答对了
    await flushPromises()

    expect(recordAnswer).toHaveBeenCalledWith('c1-s1-003', true, 'self:correct')
    expect(wrapper.find('.self-assess').exists()).toBe(false)
    expect(wrapper.find('.analysis').exists()).toBe(true)
    expect(wrapper.find('.result-feedback').text()).toContain('自评正确')
  })

  it('自评「答错了」写 study_record(self:wrong)', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()
    await toAnswerQuestion(wrapper)

    await wrapper.find('.answer-area .btn-primary').trigger('click')
    await flushPromises()
    await wrapper.find('.self-assess .btn-danger').trigger('click') // 答错了
    await flushPromises()

    expect(recordAnswer).toHaveBeenCalledWith('c1-s1-003', false, 'self:wrong')
    expect(wrapper.find('.result-feedback').text()).toContain('自评错误')
  })

  it('自评只触发一次，重复点击不重复写记录', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()
    await toAnswerQuestion(wrapper)

    await wrapper.find('.answer-area .btn-primary').trigger('click')
    await flushPromises()
    await wrapper.find('.self-assess .btn-success').trigger('click')
    await flushPromises()
    expect(recordAnswer).toHaveBeenCalledTimes(1)
  })

  it('查看答案后「标记错题」按钮隐藏（已 submitted 避免重复计数）', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()
    await toAnswerQuestion(wrapper)

    await wrapper.find('.answer-area .btn-primary').trigger('click')
    await flushPromises()

    const texts = wrapper.findAll('.practice-bottom button').map((b) => b.text())
    expect(texts).not.toContain('标记错题')
  })
})

describe('PracticeView — 导航与收藏', () => {
  it('末题未作答时「完成」禁用；自评通过后完成跳转章节页', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()

    const next = btnByText(wrapper, '下一题')
    await next.trigger('click')
    await flushPromises()
    await next.trigger('click')
    await flushPromises()
    await next.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('第 4 / 4 题')

    const findComplete = () =>
      wrapper.findAll('.practice-bottom button').find((b) => b.text() === '完成')!

    const complete = findComplete()
    expect(complete.element).toHaveProperty('disabled', true) // 未作答禁用
    await complete.trigger('click')
    expect(routerMock.push).not.toHaveBeenCalled()

    await wrapper.find('.self-assess .btn-success').trigger('click') // 题图题自评答对
    await flushPromises()

    const complete2 = findComplete()
    expect(complete2.element).toHaveProperty('disabled', false) // 已作答可完成
    await complete2.trigger('click')
    expect(routerMock.push).toHaveBeenCalledWith('/chapters')
  })

  it('收藏按钮切换状态', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()

    const fav = wrapper.find('.fav-btn')
    expect(fav.text()).toBe('☆')
    await fav.trigger('click')
    expect(wrapper.find('.fav-btn').text()).toBe('★')
    await wrapper.find('.fav-btn').trigger('click')
    expect(wrapper.find('.fav-btn').text()).toBe('☆')
  })
})

describe('PracticeView — AI 讲解', () => {
  it('底部有「AI 讲解」按钮，点击触发 openWithContext 且传入 buildExplainPrompt 的上下文', async () => {
    const wrapper = mount(PracticeView)
    await flushPromises()

    const aiBtn = wrapper.find('.ai-explain-btn')
    expect(aiBtn.exists()).toBe(true)
    expect(aiBtn.text()).toBe('AI 讲解')

    await aiBtn.trigger('click')
    expect(buildExplainPrompt).toHaveBeenCalledTimes(1)
    expect(openWithContext).toHaveBeenCalledWith('context-text')
  })
})
