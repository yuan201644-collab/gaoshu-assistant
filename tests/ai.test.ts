// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  AI_CONFIG_KEY,
  defaultAiConfig,
  loadAiConfig,
  saveAiConfig,
  chatCompletion,
  streamChatCompletion,
  SYSTEM_EXPLAIN_PROMPT,
  buildExplainPrompt,
} from '@/services/ai'
import type { Question } from '@/types/question'

// 隔离本机 AI 配置（ai.local.ts 含真实 key），保证测试使用纯默认值
vi.mock('@/config/ai.local', () => ({ localAiConfig: {} }))

const fetchMock = vi.fn()

function okRes(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function errRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const CFG = {
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  apiKey: 'sk-test',
  temperature: 0.3,
  maxTokens: 8000,
  thinking: 'deep',
}

describe('ai.ts — localStorage 配置读写', () => {
  it('默认配置：无存储时返回默认值', () => {
    expect(loadAiConfig()).toEqual(defaultAiConfig())
  })

  it('saveAiConfig → loadAiConfig 回读一致', () => {
    const cfg = { ...CFG, model: 'gpt-4o', temperature: 0.7 }
    saveAiConfig(cfg)
    expect(loadAiConfig()).toEqual(cfg)
    expect(localStorage.getItem(AI_CONFIG_KEY)).toBe(JSON.stringify(cfg))
  })

  it('存储 JSON 损坏 → 回退默认', () => {
    localStorage.setItem(AI_CONFIG_KEY, '{not-valid-json')
    expect(loadAiConfig()).toEqual(defaultAiConfig())
  })

  it('部分字段 → 缺省用默认补齐', () => {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify({ apiKey: 'sk-partial' }))
    const loaded = loadAiConfig()
    expect(loaded.apiKey).toBe('sk-partial')
    expect(loaded.baseURL).toBe(CFG.baseURL)
    expect(loaded.model).toBe(CFG.model)
    expect(loaded.temperature).toBe(CFG.temperature)
  })
})

describe('ai.ts — chatCompletion', () => {
  it('未配置 apiKey → 抛可读错误且不发起 fetch', async () => {
    await expect(chatCompletion([{ role: 'user', content: 'hi' }])).rejects.toThrow(
      '请先在设置页配置 API',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('URL 拼接：默认 baseURL → /chat/completions', async () => {
    fetchMock.mockResolvedValueOnce(okRes({ choices: [{ message: { content: 'ok' } }] }))
    await chatCompletion([{ role: 'user', content: 'hi' }], CFG)
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/chat/completions')
  })

  it('URL 归一化：baseURL 尾斜杠不产生双斜杠', async () => {
    fetchMock.mockResolvedValueOnce(okRes({ choices: [{ message: { content: 'ok' } }] }))
    await chatCompletion([{ role: 'user', content: 'hi' }], { ...CFG, baseURL: 'https://example.com/v1/' })
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.com/v1/chat/completions')
  })

  it('请求头含 Bearer token 与 Content-Type', async () => {
    fetchMock.mockResolvedValueOnce(okRes({ choices: [{ message: { content: 'ok' } }] }))
    await chatCompletion([{ role: 'user', content: 'hi' }], CFG)
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer sk-test')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('body 含 model / messages / temperature', async () => {
    fetchMock.mockResolvedValueOnce(okRes({ choices: [{ message: { content: 'ok' } }] }))
    const messages = [{ role: 'user' as const, content: '帮我讲解' }]
    await chatCompletion(messages, { ...CFG, temperature: 0.9 })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.model).toBe('gpt-4o-mini')
    expect(body.messages).toEqual(messages)
    expect(body.temperature).toBe(0.9)
  })

  it('成功：解析 choices[0].message.content 并返回', async () => {
    fetchMock.mockResolvedValueOnce(okRes({ choices: [{ message: { content: '讲解如下' } }] }))
    await expect(chatCompletion([{ role: 'user', content: 'hi' }], CFG)).resolves.toBe('讲解如下')
  })

  it('HTTP 401 → 错误含状态码与后端 error.message', async () => {
    fetchMock.mockResolvedValueOnce(errRes(401, { error: { message: 'Invalid API key' } }))
    await expect(chatCompletion([{ role: 'user', content: 'hi' }], CFG)).rejects.toThrow(
      /HTTP 401.*Invalid API key/,
    )
  })

  it('HTTP 500（空响应体）→ 错误仍含状态码', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }))
    await expect(chatCompletion([{ role: 'user', content: 'hi' }], CFG)).rejects.toThrow(/HTTP 500/)
  })

  it('网络异常 → 抛可读错误', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(chatCompletion([{ role: 'user', content: 'hi' }], CFG)).rejects.toThrow(
      '网络异常，请检查网络连接',
    )
  })

  it('响应无 choices / content 非字符串 → 抛「AI 响应格式异常」', async () => {
    fetchMock.mockResolvedValueOnce(okRes({ choices: [] }))
    await expect(chatCompletion([{ role: 'user', content: 'hi' }], CFG)).rejects.toThrow(
      'AI 响应格式异常',
    )
  })
})

describe('ai.ts — streamChatCompletion 流式', () => {
  it('解析 SSE 流，逐块回调增量内容', async () => {
    const sse =
      'data: {"choices":[{"delta":{"content":"你好"}}]}\n\ndata: {"choices":[{"delta":{"content":"，世界"}}]}\n\ndata: [DONE]\n\n'
    fetchMock.mockResolvedValueOnce(
      new Response(sse, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
    )
    const deltas: string[] = []
    const full = await streamChatCompletion(
      [{ role: 'user', content: 'hi' }],
      (d) => deltas.push(d.content),
      CFG,
    )
    expect(deltas).toEqual(['你好', '，世界'])
    expect(full).toBe('你好，世界')
  })

  it('body 含 stream:true 与 max_tokens', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('data: {"choices":[{"delta":{"content":"x"}}]}\n\ndata: [DONE]', {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    )
    await streamChatCompletion([{ role: 'user', content: 'hi' }], () => {}, CFG)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.stream).toBe(true)
    expect(body.max_tokens).toBe(8000)
  })

  it('未配置 apiKey → 抛可读错误且不发起 fetch', async () => {
    await expect(streamChatCompletion([{ role: 'user', content: 'hi' }], () => {})).rejects.toThrow(
      '请先在设置页配置 API',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('HTTP 401 → 抛含状态码的错误', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"error":{"message":"bad"}}', { status: 401 }),
    )
    await expect(streamChatCompletion([{ role: 'user', content: 'hi' }], () => {}, CFG)).rejects.toThrow(
      /HTTP 401/,
    )
  })

  it('网络异常 → 抛可读错误', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(streamChatCompletion([{ role: 'user', content: 'hi' }], () => {}, CFG)).rejects.toThrow(
      '网络异常，请检查网络连接',
    )
  })

  it('流式结束但无内容 → 抛「AI 响应格式异常」', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('data: [DONE]', { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
    )
    await expect(streamChatCompletion([{ role: 'user', content: 'hi' }], () => {}, CFG)).rejects.toThrow(
      'AI 响应格式异常',
    )
  })
})

describe('ai.ts — buildExplainPrompt', () => {
  const q: Question = {
    id: 'c1-s1-001',
    chapter: '第一章',
    section: '1.1',
    tags: [],
    type: 'choice',
    difficulty: 1,
    source: '测试',
    question: '函数 f(x) 的定义域？',
    options: ['A', 'B', 'C', 'D'],
    answer: 'B',
    analysis: '根据定义',
  }

  it('含题型/题干/标准答案等标记，不含解析与讲解要求', () => {
    const prompt = buildExplainPrompt(q)
    expect(prompt).toContain('【题型】选择题')
    expect(prompt).toContain('【题干】函数 f(x) 的定义域？')
    expect(prompt).toContain('【标准答案】B')
    expect(prompt).not.toContain('【解析】')
    expect(prompt).not.toContain('解题思路')
    expect(prompt).not.toContain('【我的作答】')
  })

  it('SYSTEM_EXPLAIN_PROMPT 含讲解要求且不长', () => {
    expect(SYSTEM_EXPLAIN_PROMPT).toContain('解题思路')
    expect(SYSTEM_EXPLAIN_PROMPT.length).toBeLessThan(200)
  })

  it('传入 userAnswer 时含【我的作答】', () => {
    const prompt = buildExplainPrompt(q, '我选 C')
    expect(prompt).toContain('【我的作答】我选 C')
  })

  it('userAnswer 为空字符串时不渲染【我的作答】', () => {
    const prompt = buildExplainPrompt(q, '')
    expect(prompt).not.toContain('【我的作答】')
  })
})
