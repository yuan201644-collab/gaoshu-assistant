declare module 'katex' {
  interface KatexRenderOptions {
    displayMode?: boolean
    throwOnError?: boolean
    [key: string]: unknown
  }
  function renderToString(tex: string, options?: KatexRenderOptions): string
  const katex: { renderToString: typeof renderToString }
  export default katex
}
