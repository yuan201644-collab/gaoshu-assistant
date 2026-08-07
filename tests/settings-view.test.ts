// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

// 隔离本机 AI 配置（ai.local.ts 含真实 key），保证默认配置为空 apiKey
vi.mock('@/config/ai.local', () => ({ localAiConfig: {} }))

vi.mock('@/services/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/ai')>()
  return { ...actual, chatCompletion: vi.fn() }
})

import SettingsView from '@/views/SettingsView.vue'
import { loadAiConfig, chatCompletion, AI_CONFIG_KEY } from '@/services/ai'

const chatMock = vi.mocked(chatCompletion)

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('SettingsView — 表单回显', () => {
  it('已有配置 → 表单各字段回显一致', async () => {
    localStorage.setItem(
      AI_CONFIG_KEY,
      JSON.stringify({
        baseURL: 'https://example.com/v1',
        apiKey: 'sk-abc',
        model: 'gpt-4o',
        temperature: 0.7,
      }),
    )
    const wrapper = mount(SettingsView)
    await flushPromises()

    expect((wrapper.find('#ai-base-url').element as HTMLInputElement).value).toBe(
      'https://example.com/v1',
    )
    expect((wrapper.find('#ai-api-key').element as HTMLInputElement).value).toBe('sk-abc')
    expect((wrapper.find('#ai-model').element as HTMLInputElement).value).toBe('gpt-4o')
    expect((wrapper.find('#ai-temperature').element as HTMLInputElement).value).toBe('0.7')
  })
})

describe('SettingsView — 保存配置', () => {
  it('填表保存 → localStorage 回读一致 + 显示「已保存」', async () => {
    const wrapper = mount(SettingsView)
    await flushPromises()

    await wrapper.find('#ai-base-url').setValue('https://my-api.com/v1')
    await wrapper.find('#ai-api-key').setValue('sk-secret')
    await wrapper.find('#ai-model').setValue('custom-model')
    await wrapper.find('#ai-temperature').setValue('0.8')
    await wrapper.find('.btn-save').trigger('click')
    await flushPromises()

    const saved = loadAiConfig()
    expect(saved.baseURL).toBe('https://my-api.com/v1')
    expect(saved.apiKey).toBe('sk-secret')
    expect(saved.model).toBe('custom-model')
    expect(saved.temperature).toBe(0.8)
    expect(wrapper.find('.save-status').text()).toContain('已保存')
  })

  it('apiKey 为空点保存 → 提示「请填写 API Key」且不写 localStorage', async () => {
    const wrapper = mount(SettingsView)
    await flushPromises()

    await wrapper.find('#ai-base-url').setValue('https://my-api.com/v1')
    await wrapper.find('.btn-save').trigger('click')
    await flushPromises()

    expect(wrapper.find('.save-hint').text()).toContain('请填写 API Key')
    expect(localStorage.getItem(AI_CONFIG_KEY)).toBeNull()
  })
})

describe('SettingsView — 测试连接', () => {
  it('chatCompletion resolve → 显示「连接成功」', async () => {
    chatMock.mockResolvedValue('pong')
    const wrapper = mount(SettingsView)
    await flushPromises()

    await wrapper.find('.btn-test').trigger('click')
    await flushPromises()

    expect(chatMock).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.save-status').text()).toContain('连接成功')
  })

  it('chatCompletion reject → 显示错误信息', async () => {
    chatMock.mockRejectedValue(new Error('AI 请求失败（HTTP 401）：Invalid key'))
    const wrapper = mount(SettingsView)
    await flushPromises()

    await wrapper.find('.btn-test').trigger('click')
    await flushPromises()

    expect(wrapper.find('.save-status').text()).toContain('Invalid key')
  })
})
