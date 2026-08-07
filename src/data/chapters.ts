/**
 * 章节结构常量，严格对齐武忠祥《高等数学·基础篇》第一章目录。
 * 注：方案只明确给出 s1/s2 节标题，s3/s4 依据基础篇第一章主题归纳，
 * 后续需对照实际出版目录最终确认。
 */
export interface SectionInfo {
  id: string
  title: string
}

export interface ChapterInfo {
  id: string
  title: string
  sections: SectionInfo[]
}

export const chapters: ChapterInfo[] = [
  {
    id: 'c1',
    title: '第一章 函数、极限、连续',
    sections: [
      { id: 's1', title: '1.1 函数' },
      { id: 's2', title: '1.2 极限的概念' },
      { id: 's3', title: '1.3 无穷小与无穷大' },
      { id: 's4', title: '1.4 极限运算法则' },
      { id: 's5', title: '1.5 极限存在准则·两个重要极限' },
      { id: 's6', title: '1.6 无穷小的比较' },
      { id: 's7', title: '1.7 函数的连续性与间断点' },
      { id: 's8', title: '1.8 闭区间上连续函数的性质' },
    ],
  },
]
