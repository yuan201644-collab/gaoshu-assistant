/**
 * 章节结构常量，严格对齐武忠祥《高等数学·基础篇》目录（2026-08-08 OCR 自课本 PDF 第 14-19 页）。
 * 多级树：章 → 节 →（考试内容概要 / 常考题型与典型例题）→ 知识点。
 */
export interface SectionNode {
  id: string
  title: string
  children?: SectionNode[]
}

export interface ChapterInfo {
  id: string
  title: string
  /** 节级节点；其 children 为「考试内容概要 / 常考题型与典型例题」及其下知识点 */
  sections: SectionNode[]
}

/** 节内公共子结构：考试内容概要 + 常考题型与典型例题 */
function outline(children: SectionNode[]): SectionNode[] {
  return [
    { id: 'k', title: '考试内容概要', children },
  ]
}

function examples(children: SectionNode[]): SectionNode[] {
  return [{ id: 't', title: '常考题型与典型例题', children }]
}

export const chapters: ChapterInfo[] = [
  {
    id: 'c1',
    title: '第一章 函数、极限、连续',
    sections: [
      {
        id: 's1',
        title: '第一节 函数',
        children: [
          ...outline([
            { id: 'k1', title: '一、函数的概念及常见函数' },
            { id: 'k2', title: '二、函数的性质' },
          ]),
          ...examples([
            { id: 't1', title: '一、函数有界性、单调性、周期性及奇偶性的判定' },
            { id: 't2', title: '二、复合函数' },
          ]),
        ],
      },
      {
        id: 's2',
        title: '第二节 极限',
        children: [
          ...outline([
            { id: 'k1', title: '一、极限的概念' },
            { id: 'k2', title: '二、极限的性质' },
            { id: 'k3', title: '三、极限的存在准则' },
            { id: 'k4', title: '四、无穷小量' },
            { id: 'k5', title: '五、无穷大量' },
          ]),
          ...examples([
            { id: 't1', title: '一、极限的概念、性质及存在准则' },
            { id: 't2', title: '二、求极限' },
            { id: 't3', title: '三、无穷小量阶的比较' },
          ]),
        ],
      },
      {
        id: 's3',
        title: '第三节 函数的连续性',
        children: [
          ...outline([
            { id: 'k1', title: '一、连续性的概念' },
            { id: 'k2', title: '二、间断点及其分类' },
            { id: 'k3', title: '三、连续性的运算与性质' },
            { id: 'k4', title: '四、闭区间上连续函数的性质' },
          ]),
          ...examples([]),
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: '第二章 导数与微分',
    sections: [
      {
        id: 's1',
        title: '第一节 导数与微分',
        children: [
          ...outline([
            { id: 'k1', title: '一、导数与微分的概念' },
            { id: 'k2', title: '二、导数公式及求导法则' },
            { id: 'k3', title: '三、高阶导数' },
          ]),
          ...examples([
            { id: 't1', title: '一、导数定义' },
            { id: 't2', title: '二、复合函数、隐函数、参数方程求导' },
            { id: 't3', title: '三、高阶导数' },
            { id: 't4', title: '四、导数应用' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c3',
    title: '第三章 微分中值定理及导数应用',
    sections: [
      {
        id: 's1',
        title: '第一节 微分中值定理及导数应用',
        children: [
          ...outline([
            { id: 'k1', title: '一、微分中值定理' },
            { id: 'k2', title: '二、导数应用' },
          ]),
          ...examples([
            { id: 't1', title: '一、求函数的极值和最值及确定曲线的凹向和拐点' },
            { id: 't2', title: '二、求渐近线' },
            { id: 't3', title: '三、方程的根' },
            { id: 't4', title: '四、不等式的证明' },
            { id: 't5', title: '五、中值定理证明题' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c4',
    title: '第四章 不定积分',
    sections: [
      {
        id: 's1',
        title: '第一节 不定积分',
        children: [
          ...outline([
            { id: 'k1', title: '一、不定积分的概念与性质' },
            { id: 'k2', title: '二、不定积分基本公式' },
            { id: 'k3', title: '三、三种主要积分法' },
            { id: 'k4', title: '四、三类常见可积函数积分' },
          ]),
          ...examples([]),
        ],
      },
    ],
  },
  {
    id: 'c5',
    title: '第五章 定积分与反常积分',
    sections: [
      {
        id: 's1',
        title: '第一节 定积分',
        children: [
          ...outline([
            { id: 'k1', title: '一、定积分的概念' },
            { id: 'k2', title: '二、定积分的性质' },
            { id: 'k3', title: '三、积分上限函数' },
            { id: 'k4', title: '四、定积分的计算' },
          ]),
          ...examples([
            { id: 't1', title: '一、定积分的概念、性质及几何意义' },
            { id: 't2', title: '二、定积分的计算' },
            { id: 't3', title: '三、变上限积分' },
          ]),
        ],
      },
      {
        id: 's2',
        title: '第二节 反常积分',
        children: [
          ...outline([
            { id: 'k1', title: '一、无穷区间上的反常积分' },
            { id: 'k2', title: '二、无界函数的反常积分' },
          ]),
          ...examples([
            { id: 't1', title: '一、反常积分的敛散性' },
            { id: 't2', title: '二、反常积分的计算' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c6',
    title: '第六章 定积分的应用',
    sections: [
      {
        id: 's1',
        title: '第一节 定积分的应用',
        children: [
          ...outline([
            { id: 'k1', title: '一、几何应用' },
            { id: 'k2', title: '二、物理应用' },
          ]),
          ...examples([
            { id: 't1', title: '一、几何应用' },
            { id: 't2', title: '二、物理应用' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c7',
    title: '第七章 微分方程',
    sections: [
      {
        id: 's1',
        title: '第一节 微分方程',
        children: [
          ...outline([
            { id: 'k1', title: '一、常微分方程的基本概念' },
            { id: 'k2', title: '二、一阶微分方程' },
            { id: 'k3', title: '三、可降阶的高阶方程' },
            { id: 'k4', title: '四、高阶线性微分方程' },
          ]),
          ...examples([
            { id: 't1', title: '一、方程求解' },
            { id: 't2', title: '二、综合题' },
            { id: 't3', title: '三、应用题' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c8',
    title: '第八章 多元函数微分学',
    sections: [
      {
        id: 's1',
        title: '第一节 多元函数的基本概念',
        children: [
          ...outline([
            { id: 'k1', title: '一、多元函数的极限' },
            { id: 'k2', title: '二、多元函数的连续性' },
            { id: 'k3', title: '三、偏导数' },
            { id: 'k4', title: '四、全微分' },
          ]),
          ...examples([]),
        ],
      },
      {
        id: 's2',
        title: '第二节 多元函数的微分法',
        children: [
          ...outline([
            { id: 'k1', title: '一、复合函数微分法' },
            { id: 'k2', title: '二、隐函数微分法' },
          ]),
          ...examples([
            { id: 't1', title: '一、复合函数偏导数与全微分' },
            { id: 't2', title: '二、隐函数偏导数与全微分' },
          ]),
        ],
      },
      {
        id: 's3',
        title: '第三节 多元函数的极值与最值',
        children: [
          ...outline([
            { id: 'k1', title: '一、无约束极值' },
            { id: 'k2', title: '二、条件极值及拉格朗日乘数法' },
            { id: 'k3', title: '三、最大最小值' },
          ]),
          ...examples([
            { id: 't1', title: '一、求极值' },
            { id: 't2', title: '二、求最值' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c9',
    title: '第九章 二重积分',
    sections: [
      {
        id: 's1',
        title: '第一节 二重积分',
        children: [
          ...outline([
            { id: 'k1', title: '一、二重积分的概念及性质' },
            { id: 'k2', title: '二、二重积分的计算' },
          ]),
          ...examples([
            { id: 't1', title: '一、累次积分交换次序或计算' },
            { id: 't2', title: '二、二重积分计算' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c10',
    title: '第十章 无穷级数',
    sections: [
      {
        id: 's1',
        title: '第一节 常数项级数',
        children: [
          ...outline([
            { id: 'k1', title: '一、级数的概念与性质' },
            { id: 'k2', title: '二、级数的审敛准则' },
          ]),
          ...examples([]),
        ],
      },
      {
        id: 's2',
        title: '第二节 幂级数',
        children: [
          ...outline([
            { id: 'k1', title: '一、幂级数的收敛半径、收敛区间及收敛域' },
            { id: 'k2', title: '二、幂级数的性质' },
            { id: 'k3', title: '三、函数的幂级数展开' },
          ]),
          ...examples([
            { id: 't1', title: '一、求收敛半径、收敛区间及收敛域' },
            { id: 't2', title: '二、将函数展开为幂级数' },
            { id: 't3', title: '三、级数求和' },
          ]),
        ],
      },
      {
        id: 's3',
        title: '第三节 傅里叶级数',
        children: [
          ...outline([
            { id: 'k1', title: '一、傅里叶系数与傅里叶级数' },
            { id: 'k2', title: '二、收敛定理（狄利克雷）' },
            { id: 'k3', title: '三、周期为 2π 的函数的展开' },
            { id: 'k4', title: '四、周期为 2L 的函数的展开' },
          ]),
          ...examples([
            { id: 't1', title: '一、狄利克雷收敛定理' },
            { id: 't2', title: '二、将函数展开为傅里叶级数' },
          ]),
        ],
      },
    ],
  },
  {
    id: 'c11',
    title: '第十一章 向量代数与空间解析几何及多元微分学在几何上的应用',
    sections: [
      { id: 's1', title: '第一节 向量代数', children: [...outline([]), ...examples([])] },
      { id: 's2', title: '第二节 空间平面与直线', children: [...outline([]), ...examples([])] },
      { id: 's3', title: '第三节 曲面与空间曲线', children: [...outline([]), ...examples([])] },
      {
        id: 's4',
        title: '第四节 多元微分学在几何上的应用',
        children: [...outline([]), ...examples([])],
      },
    ],
  },
  {
    id: 'c12',
    title: '第十二章 多元积分学及其应用',
    sections: [
      {
        id: 's1',
        title: '第一节 三重积分',
        children: [
          ...outline([{ id: 'k1', title: '三重积分' }]),
          ...examples([]),
        ],
      },
      {
        id: 's2',
        title: '第二节 曲线积分',
        children: [
          ...outline([
            { id: 'k1', title: '一、对弧长的曲线积分（第一类曲线积分）' },
            { id: 'k2', title: '二、对坐标的曲线积分（第二类曲线积分）' },
          ]),
          ...examples([
            { id: 't1', title: '一、第一类曲线积分的计算' },
            { id: 't2', title: '二、第二类曲线积分的计算' },
          ]),
        ],
      },
      {
        id: 's3',
        title: '第三节 曲面积分',
        children: [
          ...outline([
            { id: 'k1', title: '一、对面积的曲面积分（第一类曲面积分）' },
            { id: 'k2', title: '二、对坐标的曲面积分（第二类曲面积分）' },
          ]),
          ...examples([
            { id: 't1', title: '一、第一类曲面积分的计算' },
            { id: 't2', title: '二、第二类曲面积分的计算' },
          ]),
        ],
      },
      { id: 's4', title: '第四节 多元积分应用', children: [...outline([]), ...examples([])] },
      { id: 's5', title: '第五节 场论初步', children: [...outline([]), ...examples([])] },
    ],
  },
]
