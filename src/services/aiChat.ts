import { reactive } from 'vue'

/** 全局 AI 对话状态单例：PracticeView 与 AiChat 跨组件协作的轻量协调层 */
export const aiChatState = reactive<{ isOpen: boolean; context: string }>({
  isOpen: false,
  context: '',
})

/** 打开面板并注入上下文（仅注入首条 user 消息，不自动发送） */
export function openWithContext(text: string): void {
  aiChatState.context = text
  aiChatState.isOpen = true
}

export function closeAiChat(): void {
  aiChatState.isOpen = false
}
