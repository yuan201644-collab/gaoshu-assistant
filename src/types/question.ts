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
  /** 选择题选项（type=choice 时必填） */
  options?: string[]
  /** 标准答案 */
  answer: string
  /** 官方解析 */
  analysis: string
}

/** 章节 ID 解析结果 */
export interface ChapterKey {
  /** 章序号，如 "c1" 里的 1 */
  chapter: number
  /** 节序号，如 "s1" 里的 1 */
  section: number
}
