import type { Question } from '@/types/question'

/**
 * 严选题库（题图模式）——第一章「函数、极限、连续」。
 * 来源：武忠祥《高数基础篇》严选题，扫描版 PDF 经 OCR 定位 + 单题裁剪。
 * image 指向 public/bank/ch1/ 下的单题图（每题独立裁剪）；题干为 OCR 摘要，公式详见题图。
 * 标准答案与解析暂缺（在书末参考答案页，后续 OCR 补录），判分走「自评对错」。
 */
export const yanxuanChapter1: Question[] = [
  // ===== 一、选择题（1-18）=====
  {
    id: 'c1-x01', chapter: '第一章 函数、极限、连续', section: '第一节 函数', type: 'choice',
    number: '1', tags: ['函数性质'], difficulty: 2, source: '严选题',
    question: '设函数 f(x)=[x]·cos x·e^sin x，则 f(x) 是（ ）', image: '/bank/ch1/qx01.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x02', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '2', tags: ['数列极限定义'], difficulty: 2, source: '严选题',
    question: '给出以下 4 个命题（ε-N 语言判断数列极限）', image: '/bank/ch1/qx02.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x03', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '3', tags: ['函数极限与数列极限关系'], difficulty: 2, source: '严选题',
    question: '给出以下 4 个命题（lim f(x) 与 lim f(x_n) 的关系）', image: '/bank/ch1/qx03.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x04', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '4', tags: ['复合函数极限'], difficulty: 3, source: '严选题',
    question: '给出以下 4 个命题（复合函数极限 lim f[φ(x)]）', image: '/bank/ch1/qx04.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x05', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '5', tags: ['重要极限 e'], difficulty: 2, source: '严选题',
    question: '给出以下 4 个极限，其中等于 e 的个数为（ ）', image: '/bank/ch1/qx05.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x06', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '6', tags: ['极限存在性'], difficulty: 3, source: '严选题',
    question: '给出以下 4 个极限，其中极限不存在的个数为（ ）', image: '/bank/ch1/qx06.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x07', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '7', tags: ['无穷大量·无界'], difficulty: 3, source: '严选题',
    question: '设数列通项 x_n（n 为正奇/偶数时表达式不同），n→∞ 时 x_n 是（ ）', image: '/bank/ch1/qx07.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x08', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '8', tags: ['无穷小量·有界'], difficulty: 2, source: '严选题',
    question: '当 x→0 时，变量 e^sin(1/x) 是（ ）', image: '/bank/ch1/qx08.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x09', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '9', tags: ['无界变量性质'], difficulty: 3, source: '严选题',
    question: '下列命题中正确的是（ 无界变量加/乘/无穷小的判断 ）', image: '/bank/ch1/qx09.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x10', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '10', tags: ['无穷大量性质'], difficulty: 3, source: '严选题',
    question: '下列命题中正确的是（ 无穷大量加减/乘积/倒数判断 ）', image: '/bank/ch1/qx10.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x11', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '11', tags: ['有界函数·无穷小'], difficulty: 3, source: '严选题',
    question: '下列命题中正确的是（ 有界函数与无穷小的性质 ）', image: '/bank/ch1/qx11.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x12', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '12', tags: ['无穷小阶'], difficulty: 2, source: '严选题',
    question: '当 x→0 时，下列无穷小中最低阶的是（ ）', image: '/bank/ch1/qx12.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x13', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'choice',
    number: '13', tags: ['无穷小阶'], difficulty: 2, source: '严选题',
    question: '已知当 x→0 时，e^sinα−e^tan 是 x 的 n 阶无穷小，则 n 等于（ ）', image: '/bank/ch1/qx13.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x14', chapter: '第一章 函数、极限、连续', section: '第三节 函数的连续性', type: 'choice',
    number: '14', tags: ['间断点'], difficulty: 2, source: '严选题',
    question: '已知 x₀ 为 f(x) 的间断点，则在 x₀ 处必间断的函数是（ ）', image: '/bank/ch1/qx14.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x15', chapter: '第一章 函数、极限、连续', section: '第三节 函数的连续性', type: 'choice',
    number: '15', tags: ['间断点类型'], difficulty: 3, source: '严选题',
    question: '设 f(x) 在 (-∞,+∞) 上有定义，lim f(x)=a，g(x) 分段定义，则（ ）', image: '/bank/ch1/qx15.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x16', chapter: '第一章 函数、极限、连续', section: '第三节 函数的连续性', type: 'choice',
    number: '16', tags: ['函数连续求参数'], difficulty: 2, source: '严选题',
    question: '设 f(x) 在 x=1 处连续，则（ a、b 的值 ）', image: '/bank/ch1/qx16.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x17', chapter: '第一章 函数、极限、连续', section: '第三节 函数的连续性', type: 'choice',
    number: '17', tags: ['第二类间断点'], difficulty: 2, source: '严选题',
    question: '函数 f(x) 的第二类间断点的个数为（ ）', image: '/bank/ch1/qx17.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-x18', chapter: '第一章 函数、极限、连续', section: '第三节 函数的连续性', type: 'choice',
    number: '18', tags: ['间断点类型'], difficulty: 3, source: '严选题',
    question: '设 f(x)=lim（含 e 与 x 的极限），其间断点为（ ）', image: '/bank/ch1/qx18.png',
    answer: '', analysis: '',
  },

  // ===== 二、填空题（1-12）=====
  {
    id: 'c1-t01', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '1', tags: ['极限计算'], difficulty: 2, source: '严选题',
    question: '填空题（算式见题图）', image: '/bank/ch1/qt01.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t02', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '2', tags: ['有理化·极限'], difficulty: 2, source: '严选题',
    question: 'lim (√(n+1)−√n)√(n+1) =', image: '/bank/ch1/qt02.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t03', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '3', tags: ['幂指极限'], difficulty: 2, source: '严选题',
    question: 'lim (2^n+(−1)^n+2^n 相关) =', image: '/bank/ch1/qt03.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t04', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '4', tags: ['夹逼·极限'], difficulty: 3, source: '严选题',
    question: 'lim n( 1/(n²+1) + 1/(n²+2) + … ) =', image: '/bank/ch1/qt04.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t05', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '5', tags: ['有理化·极限'], difficulty: 2, source: '严选题',
    question: 'lim (√(n²+1)−√(n²+n)) =', image: '/bank/ch1/qt05.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t06', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '6', tags: ['泰勒·极限'], difficulty: 3, source: '严选题',
    question: 'lim (arctan x−sin x)/x³ =', image: '/bank/ch1/qt06.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t07', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '7', tags: ['幂指极限'], difficulty: 2, source: '严选题',
    question: 'lim ((x+2a)/(x−a))^x = 8，则 a =', image: '/bank/ch1/qt07.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t08', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '8', tags: ['重要极限'], difficulty: 1, source: '严选题',
    question: 'lim ln(1+x)/x =', image: '/bank/ch1/qt08.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t09', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '9', tags: ['有理化·极限'], difficulty: 2, source: '严选题',
    question: 'lim x(√(x²+2)−√(x²+1)) =', image: '/bank/ch1/qt09.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t10', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '10', tags: ['无穷减无穷'], difficulty: 2, source: '严选题',
    question: 'lim (x+x²−x·e^x) =', image: '/bank/ch1/qt10.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t11', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '11', tags: ['极限求参数'], difficulty: 3, source: '严选题',
    question: '已知 lim f(x)/(2^x−1) = 3，求 lim f(x)/√(1+x²−1)', image: '/bank/ch1/qt11.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-t12', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'fill',
    number: '12', tags: ['无穷小阶'], difficulty: 2, source: '严选题',
    question: '当 x→0 时，e^(2x²)−cos x² 是 x 的 n 阶无穷小，则 n =', image: '/bank/ch1/qt12.png',
    answer: '', analysis: '',
  },

  // ===== 三、解答题（1-6）=====
  {
    id: 'c1-j01', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'answer',
    number: '1', tags: ['等价无穷小·极限'], difficulty: 3, source: '严选题',
    question: '求极限 lim [x−ln(x+√(1+x²))]sin x² / [(x−ln(1+x))(arctan x−x)]', image: '/bank/ch1/qj01.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-j02', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'answer',
    number: '2', tags: ['定积分定义·极限'], difficulty: 3, source: '严选题',
    question: '求极限 lim (1^k+2^k+…+n^k)/n^(k+1)', image: '/bank/ch1/qj02.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-j03', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'answer',
    number: '3', tags: ['极限求参数'], difficulty: 3, source: '严选题',
    question: '已知 lim (√(1−x)−ax−b) = 0，求 a 和 b', image: '/bank/ch1/qj03.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-j04', chapter: '第一章 函数、极限、连续', section: '第三节 函数的连续性', type: 'answer',
    number: '4', tags: ['间断点'], difficulty: 2, source: '严选题',
    question: '讨论函数 f(x) 的间断点并指出类型', image: '/bank/ch1/qj04.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-j05', chapter: '第一章 函数、极限、连续', section: '第二节 极限', type: 'answer',
    number: '5', tags: ['极限求函数'], difficulty: 3, source: '严选题',
    question: '设 f(x) = lim x·(1−x^(2n+1))/(1+…)，求 f(x)', image: '/bank/ch1/qj05.png',
    answer: '', analysis: '',
  },
  {
    id: 'c1-j06', chapter: '第一章 函数、极限、连续', section: '第三节 函数的连续性', type: 'answer',
    number: '6', tags: ['零点定理'], difficulty: 2, source: '严选题',
    question: '证明方程 sin x − x cos = 0 在…内至少有一个实根', image: '/bank/ch1/qj06.png',
    answer: '', analysis: '',
  },
]
