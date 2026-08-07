import type { Question } from '@/types/question'
import { localAiConfig } from '@/config/ai.local'

export interface AiConfig {
  baseURL: string
  model: string
  apiKey: string
  temperature: number
  /** 单次回答的最大 token 数（限制超长输出，默认 2000） */
  maxTokens?: number
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const AI_CONFIG_KEY = 'gaoshu:ai-config'

export function defaultAiConfig(): AiConfig {
  return { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '', temperature: 0.3, maxTokens: 8000, ...localAiConfig }
}

/** 读 localStorage；无存储/JSON 损坏 → 默认；部分字段 → 与默认 merge 补齐 */
export function loadAiConfig(): AiConfig {
  const def = defaultAiConfig()
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    if (!raw) return { ...def }
    const parsed = JSON.parse(raw) as Partial<AiConfig>
    return { ...def, ...parsed }
  } catch {
    return { ...def }
  }
}

/** 写 localStorage（try/catch 静默） */
export function saveAiConfig(cfg: AiConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg))
  } catch {
    /* localStorage 不可用时静默忽略 */
  }
}

/**
 * OpenAI 兼容 chat/completions 封装。
 * 错误统一在此抛出，调用方（AiChat/SettingsView）catch 后展示。
 */
export async function chatCompletion(
  messages: ChatMessage[],
  cfg: AiConfig = loadAiConfig(),
): Promise<string> {
  if (!cfg.apiKey) throw new Error('请先在设置页配置 API')
  const base = cfg.baseURL.replace(/\/+$/, '')

  let res: Response
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: cfg.temperature,
        max_tokens: cfg.maxTokens ?? 2000,
      }),
    })
  } catch {
    throw new Error('网络异常，请检查网络连接')
  }

  if (!res.ok) {
    let msg = ''
    try {
      const data = await res.json()
      msg = (data as { error?: { message?: string } })?.error?.message ?? ''
    } catch {
      /* 错误响应体解析失败时忽略 msg */
    }
    throw new Error(`AI 请求失败（HTTP ${res.status}）：${msg}`)
  }

  const data = await res.json()
  const content = (data as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]
    ?.message?.content
  if (typeof content !== 'string') throw new Error('AI 响应格式异常')
  return content
}

/**
 * 流式 chat/completions：边生成边通过 onDelta 回调增量内容。
 * 长回答（AI 讲解）用流式，首字更快可见，不用等全部生成完。
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  onDelta: (delta: string) => void,
  cfg: AiConfig = loadAiConfig(),
): Promise<string> {
  if (!cfg.apiKey) throw new Error('请先在设置页配置 API')
  const base = cfg.baseURL.replace(/\/+$/, '')

  let res: Response
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: cfg.temperature,
        max_tokens: cfg.maxTokens ?? 2000,
        stream: true,
      }),
    })
  } catch {
    throw new Error('网络异常，请检查网络连接')
  }

  if (!res.ok) {
    let msg = ''
    try {
      const data = await res.json()
      msg = (data as { error?: { message?: string } })?.error?.message ?? ''
    } catch {
      /* 错误响应体解析失败时忽略 msg */
    }
    throw new Error(`AI 请求失败（HTTP ${res.status}）：${msg}`)
  }

  if (!res.body) throw new Error('AI 响应格式异常')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const data = t.slice(5).trim()
      if (data === '[DONE]') continue
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>
        }
        const delta = json.choices?.[0]?.delta?.content ?? ''
        if (delta) {
          full += delta
          onDelta(delta)
        }
      } catch {
        /* 忽略无法解析的 SSE 行 */
      }
    }
  }
  if (!full) throw new Error('AI 响应格式异常')
  return full
}

/** 构造讲解 prompt：稳定标记 + 题干/作答/答案/解析 + 结尾请求语 */
export function buildExplainPrompt(question: Question, userAnswer?: string): string {
  const typeLabel =
    question.type === 'choice' ? '选择题' : question.type === 'fill' ? '填空题' : '解答题'
  const lines = [
    '请根据下面的题目信息，给出一份详细的数学讲解。',
    `【题型】${typeLabel}`,
    `【题干】${question.question}`,
  ]
  if (userAnswer !== undefined && userAnswer !== '') {
    lines.push(`【我的作答】${userAnswer}`)
  }
  lines.push(`【标准答案】${question.answer}`)
  lines.push(`【解析】${question.analysis}`)
  lines.push('请用通俗易懂的语言讲解解题思路与关键步骤，并指出易错点。')
  lines.push('数学公式请用 $$...$$ 包裹（行内公式用 $...$）。')
  return lines.join('\n')
}
