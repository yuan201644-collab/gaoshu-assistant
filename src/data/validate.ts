import type { Question } from '@/types/question'

/** 校验单道题目结构，返回错误信息数组（空数组表示合法） */
export function validateQuestion(q: Question): string[] {
  const errors: string[] = []
  // 兼容文本题 c1-s1-001 与严选题图题 c1-x01 / c1-t01 / c1-j01
  const idPattern = /^c\d+-s\d+-\d{3}$|^c\d+-[xtj]\d+$/

  if (!q.id || !idPattern.test(q.id)) {
    errors.push(`id "${q.id}" 不符合 c<章>-s<节>-<3位序号> 或 c<章>-<x/t/j><题号> 格式`)
  }
  if (!q.chapter) errors.push('chapter 不能为空')
  if (!q.section) errors.push('section 不能为空')
  if (!Array.isArray(q.tags) || q.tags.length === 0) errors.push('tags 至少包含一个知识点标签')
  if (!['choice', 'fill', 'answer'].includes(q.type)) errors.push(`type "${q.type}" 非法`)
  if (![1, 2, 3].includes(q.difficulty)) errors.push('difficulty 必须是 1-3')
  if (!q.source) errors.push('source 不能为空')
  if (!q.question) errors.push('question 不能为空')
  // 题图题（扫描版）无标准答案/选项，走自评，其余字段已校验
  if (q.image) return errors
  if (q.type === 'choice') {
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push('选择题至少要有 2 个选项')
  }
  if (!q.answer) errors.push('answer 不能为空')
  if (!q.analysis) errors.push('analysis 不能为空')
  return errors
}

/** 批量校验整个题库，返回 { id: errors[] } 映射，只含非法题目 */
export function validateBank(bank: Question[]): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  const seen = new Set<string>()
  for (const q of bank) {
    const errs = validateQuestion(q)
    if (errs.length > 0) result[q.id] = errs
    if (seen.has(q.id)) {
      result[q.id] = [...(result[q.id] ?? []), '题库中存在重复 id']
    }
    seen.add(q.id)
  }
  return result
}

/** 解析题目 id "c1-s1-002" → { chapter: 1, section: 1 } */
export function parseQuestionId(id: string): { chapter: number; section: number } | null {
  const m = /^c(\d+)-s(\d+)-\d{3}$/.exec(id)
  if (!m) return null
  return { chapter: Number(m[1]), section: Number(m[2]) }
}
