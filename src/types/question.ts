export type QuestionType = 'choice' | 'fill' | 'answer'

export interface Question {
  /** 唯一 ID：章-节-序号，如 c1-s1-001 */
  id: string
  /** 所属章标题，如 "第一章 函数、极限、连续" */
  chapter: string
  /** 所属节标题，如 "1.1 函数" */
  section: string
  /** 知识点标签，如 ["函数概念", "定义域求解"] */
  tags: string[]
  /** 题型 */
  type: QuestionType
  /** 难度 1-3 */
  difficulty: 1 | 2 | 3
  /** 题目来源，如 "基础篇例题" / "严选题" */
  source: string
  /** 题目文本，公式用 $$...$$ 包裹 */
  question: string
  /** 题图（扫描版题目）路径，存在时优先显示图片 */
  image?: string
  /** 原书题号，如严选题第 3 题 */
  number?: string
  /** 选择题选项（type=choice 时必填） */
  options?: string[]
  /** 标准答案（题图题暂无，走自评） */
  answer: string
  /** 官方解析 */
  analysis: string
  /** 来源类型：manual 手动 / mineru_dev 开发端流水线 / local_ocr 手机识图（预留） */
  sourceType?: 'manual' | 'mineru_dev' | 'local_ocr'
  /** 来源图片 URL */
  sourceImageUrl?: string
  /** 来源原始结构化数据（MinerU/OCR 元数据） */
  sourceRawJson?: Record<string, unknown> | null
}

/** 章节 ID 解析结果 */
export interface ChapterKey {
  /** 章序号，如 "c1" 里的 1 */
  chapter: number
  /** 节序号，如 "s1" 里的 1 */
  section: number
}
