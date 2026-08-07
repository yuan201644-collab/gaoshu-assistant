import type { Question } from '@/types/question'
import { questionBank } from './questionBank'
import { yanxuanChapter1 } from './yanxuanBank'

/** 全部题目：文本样本题 + 严选题图题，刷题/章节页统一从此取数 */
export const allQuestions: Question[] = [...questionBank, ...yanxuanChapter1]

/** 按章 + 节标题筛选题目（不依赖 id 格式，兼容文本题与题图题） */
export function questionsOf(chapterTitle: string, sectionTitle: string): Question[] {
  return allQuestions.filter((q) => q.chapter === chapterTitle && q.section === sectionTitle)
}
