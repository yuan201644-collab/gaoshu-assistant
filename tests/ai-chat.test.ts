// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/services/ai', () => ({
  chatCompletion: vi.fn(),
  loadAiConfig: vi.fn(() => ({
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    apiKey: 'sk-test',
    temperature: 0.3,
  })),
}))

import AiChat from '@/components/AiChat.vue'
import { chatCompletion } from '@/services/ai'
import { openWithContext, aiChatState } from '@/services/aiChat'
import type { ChatMessage } from '@/services/ai'

const chatMock = vi.mocked(chatCompletion)

/** 已挂载的 wrapper 集合，afterEach 统一卸载，防止旧组件 watcher 污染 aiChatState */
let mountedWrappers: Array<ReturnType<typeof mount>> = []

function mountAiChat() {
  const w = mount(AiChat)
  mountedWrappers.push(w)
  return w
}

/** 打开面板的公共步骤 */
async function openPanel(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('.ai-fab').trigger('click')
  await nextTick()
}

/** 推进打字机完成：等待真实时间让回复逐字填充完成 */
async function flushType() {
  await flushPromises()
  await new Promise((r) => setTimeout(r, 500))
  await nextTick()
}

beforeEach(() => {
  vi.clearAllMocks()
  // aiChatState 为模块级单例，跨用例共享；显式复位保证从隐藏态起步
  aiChatState.isOpen = false
  aiChatState.context = ''
})

afterEach(() => {
  mountedWrappers.forEach((w) => w.unmount())
  mountedWrappers = []
})

describe('AiChat — 面板开合', () => {
  it('初始面板隐藏，点 FAB 展开，点关闭收起', async () => {
    const wrapper = mountAiChat()
    expect(wrapper.find('.ai-panel').exists()).toBe(false)

    await wrapper.find('.ai-fab').trigger('click')
    await nextTick()
    expect(wrapper.find('.ai-panel').exists()).toBe(true)

    await wrapper.find('.ai-close').trigger('click')
    await nextTick()
    expect(wrapper.find('.ai-panel').exists()).toBe(false)
  })
})

describe('AiChat — 发送消息', () => {
  it('输入 + 回车发送：chatCompletion 收到含该 user 消息的数组，回复渲染为 assistant 气泡', async () => {
    chatMock.mockResolvedValue('好的，我来讲解')
    const wrapper = mountAiChat()
    await openPanel(wrapper)

    await wrapper.find('.ai-input').setValue('帮我讲解这道题')
    await wrapper.find('.ai-input').trigger('keydown.enter')
    await flushType()

    expect(chatMock).toHaveBeenCalledTimes(1)
    const msgs = chatMock.mock.calls[0][0] as ChatMessage[]
    expect(msgs.some((m) => m.role === 'user' && m.content === '帮我讲解这道题')).toBe(true)
    expect(wrapper.find('.ai-msg-assistant').text()).toContain('好的，我来讲解')
  })

  it('点击发送按钮同样触发', async () => {
    chatMock.mockResolvedValue('回复')
    const wrapper = mountAiChat()
    await openPanel(wrapper)

    await wrapper.find('.ai-input').setValue('用按钮发送')
    await wrapper.find('.ai-send').trigger('click')
    await flushType()

    expect(chatMock).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.ai-msg-assistant').text()).toContain('回复')
  })

  it('空输入点发送不触发请求', async () => {
    const wrapper = mountAiChat()
    await openPanel(wrapper)

    await wrapper.find('.ai-send').trigger('click')
    await flushPromises()
    expect(chatMock).not.toHaveBeenCalled()
  })

  it('Shift+Enter 不发送、不触发请求', async () => {
    const wrapper = mountAiChat()
    await openPanel(wrapper)

    await wrapper.find('.ai-input').setValue('换行测试')
    await wrapper.find('.ai-input').trigger('keydown', { key: 'Enter', shiftKey: true })
    await flushPromises()
    expect(chatMock).not.toHaveBeenCalled()
  })
})

describe('AiChat — 快捷指令', () => {
  it('点击 chip「讲解这道题」以该文本作为 user 消息发送', async () => {
    chatMock.mockResolvedValue('讲解')
    const wrapper = mountAiChat()
    await openPanel(wrapper)

    const chip = wrapper.findAll('.ai-chip').find((c) => c.text() === '讲解这道题')!
    expect(chip).toBeTruthy()
    await chip.trigger('click')
    await flushPromises()

    expect(chatMock).toHaveBeenCalledTimes(1)
    const msgs = chatMock.mock.calls[0][0] as ChatMessage[]
    expect(msgs.some((m) => m.role === 'user' && m.content === '讲解这道题')).toBe(true)
  })
})

describe('AiChat — 上下文注入 openWithContext', () => {
  it('openWithContext 打开面板并注入首条 user 消息', async () => {
    const wrapper = mountAiChat()
    expect(wrapper.find('.ai-panel').exists()).toBe(false)

    openWithContext('请讲解：函数极限的定义')
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.ai-panel').exists()).toBe(true)
    expect(wrapper.find('.ai-msg-user').text()).toContain('请讲解：函数极限的定义')
  })
})

describe('AiChat — 加载态与错误', () => {
  it('发送后显示「思考中…」，resolve 后消失并渲染回复', async () => {
    let resolveFn!: (v: string) => void
    chatMock.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveFn = resolve
      }),
    )
    const wrapper = mountAiChat()
    await openPanel(wrapper)

    await wrapper.find('.ai-input').setValue('等待回复')
    await wrapper.find('.ai-send').trigger('click')
    await nextTick()

    expect(wrapper.find('.ai-thinking').exists()).toBe(true)
    expect(wrapper.find('.ai-send').attributes('disabled')).toBeDefined()

    resolveFn('回复完毕')
    await flushType()

    expect(wrapper.find('.ai-thinking').exists()).toBe(false)
    expect(wrapper.find('.ai-msg-assistant').text()).toContain('回复完毕')
  })

  it('chatCompletion reject → 展示错误文本', async () => {
    chatMock.mockRejectedValue(new Error('AI 请求失败（HTTP 429）：限流'))
    const wrapper = mountAiChat()
    await openPanel(wrapper)

    await wrapper.find('.ai-input').setValue('触发错误')
    await wrapper.find('.ai-send').trigger('click')
    await flushPromises()

    expect(wrapper.find('.ai-msg-error').text()).toContain('AI 请求失败（HTTP 429）')
  })
})
