<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps<{ text: string }>()

interface Segment {
  type: 'text' | 'math'
  content: string
  display: boolean
}

/** 把文本切成普通段与公式段：$$...$$ / \[...\] 块级，$...$ 内联 */
const segments = computed<Segment[]>(() => {
  const segs: Segment[] = []
  const pattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = pattern.exec(props.text)) !== null) {
    if (m.index > lastIndex) {
      segs.push({ type: 'text', content: props.text.slice(lastIndex, m.index), display: false })
    }
    const token = m[1]
    const display = token.startsWith('$$') || token.startsWith('\\[')
    let content = token
    if (token.startsWith('$$') || token.startsWith('\\[')) content = token.slice(2, -2)
    else content = token.slice(1, -1)
    segs.push({ type: 'math', content, display })
    lastIndex = m.index + token.length
  }
  if (lastIndex < props.text.length) {
    segs.push({ type: 'text', content: props.text.slice(lastIndex), display: false })
  }
  return segs
})

/** 渲染失败降级：throwOnError 不抛错；仍异常时回退原文 */
function renderMath(content: string, display: boolean): string {
  try {
    return katex.renderToString(content, { displayMode: display, throwOnError: false })
  } catch {
    return content
  }
}
</script>

<template>
  <template v-for="(seg, i) in segments" :key="i">
    <span v-if="seg.type === 'text'">{{ seg.content }}</span>
    <span v-else v-html="renderMath(seg.content, seg.display)"></span>
  </template>
</template>
