import type { Question } from '@/types/question'

/**
 * 数学答案字符串归一化（导出供单测直测）。
 * 步骤：trim→toLowerCase → 全角转半角 → 删全部空白 → 符号归一 → LaTeX 归一。
 * 仅做字符串层面容错，不做数值语义等价（如 `1/2` 与 `0.5` 判不等，见方案风险）。
 */
export function normalizeMath(s: string): string {
  let out = s.trim().toLowerCase()

  // 全角转半角（至少括号与加减号）
  out = out
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/＋/g, '+')
    .replace(/－/g, '-')
    .replace(/，/g, ',')
    .replace(/；/g, ';')

  // 删除全部空白字符（含空格/制表符/换行/全角空格）
  out = out.replace(/\s+/g, '')

  // 符号归一：± 类 → pm；π 类 → pi；× → *
  out = out.replace(/±/g, 'pm')
  out = out.replace(/\+_/g, 'pm')
  out = out.replace(/\+-/g, 'pm')
  out = out.replace(/\+\/-/g, 'pm')
  out = out.replace(/π|Π|∏/g, 'pi')
  out = out.replace(/×/g, '*')

  // LaTeX 归一（顺序执行）
  out = out.replace(/\$\$/g, '')
  out = out.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
  out = out.replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)')
  out = out.replace(/\\cdot|\\times/g, '*')
  out = out.replace(/\\left|\\right/g, '')
  out = out.replace(/[{}]/g, '')
  out = out.replace(/\\/g, '')

  return out
}

/**
 * 判分纯函数。
 * - choice：选项序号精确匹配、大小写敏感
 * - fill：归一化后比较
 * - answer：不自动判分，恒 false（UI 走「查看答案」手动核对 + 「标记错题」）
 */
export function judgeAnswer(question: Question, userAnswer: string): boolean {
  switch (question.type) {
    case 'choice':
      return userAnswer === question.answer
    case 'fill':
      return normalizeMath(question.answer) === normalizeMath(userAnswer)
    case 'answer':
    default:
      return false
  }
}
