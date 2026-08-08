<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { aiChatState, openWithContext, closeAiChat } from '@/services/aiChat'
import {
  streamChatCompletion,
  SYSTEM_EXPLAIN_PROMPT,
  loadAiConfig,
  saveAiConfig,
} from '@/services/ai'
import type { ChatMessage } from '@/services/ai'
import MarkdownKatex from '@/components/MarkdownKatex.vue'

type UiMessage = ChatMessage & { error?: boolean; reasoning?: string }

const QUICK_CHIPS = ['讲解这道题', '分析易错点', '出变式题', '通俗解释概念']

const messages = ref<UiMessage[]>([])
const input = ref('')
const sending = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

function scrollToBottom() {
  const el = messagesEl.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(
  () => aiChatState.context,
  (ctx) => {
    if (ctx) {
      messages.value.push({ role: 'user', content: ctx })
      aiChatState.context = ''
      scrollToBottom()
    }
  },
)

watch(
  () => aiChatState.isOpen,
  (open) => {
    if (open) nextTick(scrollToBottom)
  },
)

onMounted(() => {
  // 单例状态跨用例共享：挂载时复位，保证组件测试从隐藏态起步
  aiChatState.isOpen = false
  aiChatState.context = ''
})

function togglePanel() {
  aiChatState.isOpen = !aiChatState.isOpen
}

function send() {
  const text = input.value.trim()
  if (!text || sending.value) return
  sendText(text)
}

/** 对话界面直接切换思考深度：联动模型并持久化到配置 */
const thinkingMode = ref<'deep' | 'light'>(loadAiConfig().thinking ?? 'deep')
function switchThinking(mode: 'deep' | 'light') {
  if (thinkingMode.value === mode) return
  thinkingMode.value = mode
  const cfg = loadAiConfig()
  cfg.thinking = mode
  cfg.model = mode === 'deep' ? 'deepseek-v4-flash' : 'deepseek-chat'
  saveAiConfig(cfg)
}

async function sendText(text: string) {
  messages.value.push({ role: 'user', content: text })
  messages.value.push({ role: 'assistant', content: '' })
  input.value = ''
  sending.value = true
  scrollToBottom()
  try {
    const history = messages.value
      .filter((m) => m.content)
      .map(({ role, content }) => ({ role, content }))
    // 讲解要求放 system 消息，不进入对话气泡；user 只含题目上下文
    const payload: ChatMessage[] = [{ role: 'system', content: SYSTEM_EXPLAIN_PROMPT }, ...history]
    await streamChatCompletion(payload, (chunk) => {
      // 必须通过 messages.value 访问 proxy 元素更新，直接改局部对象不触发响应式
      const last = messages.value[messages.value.length - 1]
      if (!last || last.role !== 'assistant') return
      // 推理阶段不显示思考过程（英文无意义），只等正式回答 content
      if (chunk.content) last.content += chunk.content
      scrollToBottom()
    })
  } catch (e) {
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant') {
      last.content = (e as Error).message || '请求失败'
      last.error = true
    }
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

defineExpose({ openWithContext })
</script>

<template>
  <button class="ai-fab" aria-label="AI 讲解" @click="togglePanel">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  </button>

  <div v-if="aiChatState.isOpen" class="ai-panel">
    <div class="ai-header">
      <span class="ai-title">AI 讲解</span>
      <button class="ai-close" aria-label="关闭" @click="closeAiChat">×</button>
    </div>

    <div ref="messagesEl" class="ai-messages">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="ai-msg"
        :class="
          msg.role === 'user'
            ? 'ai-msg-user'
            : msg.error
              ? 'ai-msg-error'
              : 'ai-msg-assistant'
        "
      >
        <span class="ai-msg-label">{{ msg.role === 'user' ? '我' : 'AI' }}</span>
        <div class="ai-msg-body">
          <span
            v-if="msg.role === 'assistant' && !msg.content && sending"
            class="ai-thinking"
          >
            <span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>
            <span class="ai-thinking-text">正在推理中…</span>
          </span>
          <MarkdownKatex v-else :text="msg.content" />
        </div>
      </div>
    </div>

    <div class="ai-chips">
      <button v-for="chip in QUICK_CHIPS" :key="chip" class="ai-chip" @click="sendText(chip)">
        {{ chip }}
      </button>
    </div>

    <div class="ai-mode-row">
      <span class="ai-mode-label">思考：{{ thinkingMode === 'deep' ? '深度' : '快速' }}</span>
      <div class="ai-thinking-switch" role="group" aria-label="思考深度">
        <button
          type="button"
          :class="{ 'is-active': thinkingMode === 'deep' }"
          @click="switchThinking('deep')"
        >
          深度
        </button>
        <button
          type="button"
          :class="{ 'is-active': thinkingMode === 'light' }"
          @click="switchThinking('light')"
        >
          快速
        </button>
      </div>
    </div>

    <div class="ai-input-row">
      <textarea
        v-model="input"
        class="ai-input"
        placeholder="输入你的问题…"
        rows="2"
        @keydown.enter.exact.prevent="send"
        @keydown.enter.shift.prevent
      ></textarea>
      <button class="btn btn-primary ai-send" :disabled="sending" @click="send">发送</button>
    </div>
  </div>
</template>

<style scoped>
.ai-fab {
  position: fixed;
  right: 16px;
  bottom: calc(env(safe-area-inset-bottom) + 76px);
  z-index: var(--z-fab);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: #fff;
  box-shadow: var(--shadow-float);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ai-fab:active {
  transform: scale(0.94);
}

.ai-fab svg {
  width: 24px;
  height: 24px;
}

.ai-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: min(420px, 100vw);
  z-index: var(--z-panel);
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border-left: 1px solid var(--color-border);
  box-shadow: -12px 0 32px rgba(50, 68, 160, 0.18);
  animation: ai-panel-in 0.22s ease;
}

@keyframes ai-panel-in {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(14px + env(safe-area-inset-top)) 16px 14px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  font-size: 16px;
  font-weight: 700;
}

.ai-close {
  font-size: 22px;
  line-height: 1;
  color: var(--color-text-muted);
  padding: 4px 10px;
}

.ai-mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.ai-mode-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.ai-thinking-switch {
  display: flex;
  gap: 4px;
}

.ai-thinking-switch button {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: var(--color-surface);
  transition: all 0.2s ease;
}

.ai-thinking-switch button.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-msg {
  display: flex;
  gap: 8px;
  max-width: 92%;
}

.ai-msg-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-msg-label {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-msg-body {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px var(--radius-md) var(--radius-md) var(--radius-md);
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  box-shadow: var(--shadow-card);
}

.ai-msg-user .ai-msg-body {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: #fff;
  border: none;
  border-radius: var(--radius-md) 4px var(--radius-md) var(--radius-md);
}

.ai-msg-error .ai-msg-body {
  background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
  color: var(--color-danger);
}

.ai-thinking {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
}

.ai-thinking-text {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-left: 2px;
}

.ai-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: ai-bounce 1.2s infinite ease-in-out;
}

.ai-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.ai-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes ai-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.ai-chip {
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 13px;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s ease;
}

@media (hover: hover) {
  .ai-chip:hover {
    background: color-mix(in srgb, var(--color-primary-soft) 80%, var(--color-primary));
  }
}

.ai-input-row {
  display: flex;
  gap: 8px;
  padding: 10px 16px calc(env(safe-area-inset-bottom) + 10px);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.ai-input {
  flex: 1;
  resize: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  background: var(--color-bg);
}

.ai-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
</style>
