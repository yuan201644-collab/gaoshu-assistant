<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'
import { marked } from 'marked'

const props = defineProps<{ text: string }>()

/** 先提取公式段为占位符（避免 marked 干扰），渲染 markdown 后再替换为 KaTeX */
const html = computed<string>(() => {
  const src = props.text
  const pattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$)/g
  const mathBlocks: string[] = []
  let acc = ''
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = pattern.exec(src)) !== null) {
    acc += src.slice(lastIndex, m.index)
    mathBlocks.push(m[1])
    acc += `@@MATH${mathBlocks.length - 1}@@`
    lastIndex = m.index + m[1].length
  }
  acc += src.slice(lastIndex)

  let htmlStr: string
  try {
    htmlStr = marked.parse(acc, { async: false }) as string
  } catch {
    htmlStr = acc
  }

  mathBlocks.forEach((token, i) => {
    const isBlockSyntax = token.startsWith('$$') || token.startsWith('\\[')
    const content = isBlockSyntax ? token.slice(2, -2) : token.slice(1, -1)
    let katexHtml: string
    try {
      katexHtml = katex.renderToString(content, { displayMode: isBlockSyntax, throwOnError: false })
    } catch {
      katexHtml = content
    }
    htmlStr = htmlStr.split(`@@MATH${i}@@`).join(katexHtml)
  })
  return htmlStr
})
</script>

<template>
  <div class="md-content" v-html="html"></div>
</template>

<style scoped>
.md-content {
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.md-content :deep(p) {
  margin: 0 0 8px;
}

.md-content :deep(p:last-child),
.md-content :deep(ul:last-child),
.md-content :deep(ol:last-child) {
  margin-bottom: 0;
}

.md-content :deep(h1),
.md-content :deep(h2),
.md-content :deep(h3),
.md-content :deep(h4) {
  margin: 10px 0 6px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.md-content :deep(ul),
.md-content :deep(ol) {
  margin: 0 0 8px;
  padding-left: 20px;
}

.md-content :deep(li) {
  margin: 2px 0;
}

.md-content :deep(code) {
  background: var(--color-primary-soft);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.92em;
}

.md-content :deep(pre) {
  background: var(--color-bg);
  padding: 10px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 0 0 8px;
}

.md-content :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: 10px;
  color: var(--color-text-muted);
  margin: 0 0 8px;
}

.md-content :deep(.katex-display) {
  margin: 8px 0;
}
</style>
