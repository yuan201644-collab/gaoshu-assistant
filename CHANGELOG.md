# Changelog

## v1.7.0 - 2026-08-08

**AI 思考深度切换 + 完整课本章节树**

- AI 对话界面思考深度切换：深度（deepseek-v4-flash 推理）/ 快速（deepseek-chat 秒回），对话窗内一键切换并持久化
- 完整课本章节树：OCR 课本目录，12 章 → 节 → 考试内容概要 / 常考题型 → 知识点 多级结构
- 章节页多级渲染（可折叠），知识点标签展示
- 现有第一章题目适配新节结构（第一节函数 / 第二节极限 / 第三节连续性）
- 测试扩展至 111 项

## v1.6.2 - 2026-08-08

**PATCH：AI 讲解 prompt 优化 + 修复旧配置截断**

- 讲解要求移入 system 消息，user 消息只含题目（长度缩短约 4 倍，消除省略号）
- loadAiConfig 强制 maxTokens=8000，不受旧 localStorage 配置（2000）覆盖

## v1.6.1 - 2026-08-08

**PATCH：修复 AI 复杂题回答被截断**

- max_tokens 2000 → 8000：v4-flash 推理模型的思考过程消耗大量 token，导致正式回答被截断（content 为空报「AI 响应格式异常」）
- 复杂题完整输出验证通过

## v1.6.0 - 2026-08-08

**AI 讲解流式输出优化**

- DeepSeek 流式 SSE：AI 回答边生成边显示，首字 1-3 秒可见，不再等全部生成完
- max_tokens 限制（默认 2000），防止超长输出拖慢响应
- 修复流式消息响应式更新
- 测试扩展至 106 项

## v1.5.0 - 2026-08-07

**严选题库（单题图）+ 开发端 MinerU 流水线**

- 严选题第一章 36 题：OCR 定位 + 单题独立裁剪（选择 18 / 填空 12 / 解答 6），刷题页显示单题图
- 章节结构更新为 8 个知识点节，题目按知识点归属
- 开发端 MinerU 流水线：tools/pdf_pipeline（PDF → MinerU → DeepSeek → 结构化题目 JSON）
- APP 预留 OCR 字段（sourceType / sourceImageUrl / sourceRawJson）与 ocrService 空壳
- 测试扩展至 101 项

## v1.4.0 - 2026-08-07

**移动端体验优化**

- 状态栏 / 安全区适配：页面顶部避免与系统时间、电量重叠
- AI 回复 Markdown 渲染：`*` / `#` / 列表等正确显示（新增 MarkdownKatex 组件）
- 修复题解大片空白：KatexText 块级公式改为上下文感知，句中公式行内渲染
- 路由切换过渡动画 + 卡片入场动画
- AI 思考跳动动画 + 回复打字机逐字显示
- 测试扩展至 96 项

## v1.3.0 - 2026-08-07

**UI 视觉升级 + AI 公式渲染**

- 设计系统升级：主色降饱和、带色调阴影、type scale、数字等宽（tnum）、z-index 阶梯
- 交互状态补齐：按钮 hover / pressed / focus-visible，选项 / 章节 / 表单交互反馈
- Tab 导航图标化 + 毛玻璃背景；AI 悬浮球图标化 + 面板动画 + 气泡质感
- AI 对话公式渲染：KatexText 支持 `\[...\]` 块级公式，对话窗显示数学符号
- 讲解 prompt 引导 AI 使用 `$$...$$` 公式格式
- 测试扩展至 96 项

## v1.2.1 - 2026-08-07

**PATCH：AI 讲解默认接入 DeepSeek**

- 默认 AI 配置指向 DeepSeek v4-flash（baseURL https://api.deepseek.com/v1）
- 本机 API key 存于 gitignored `src/config/ai.local.ts`，不入 git
- 测试隔离本机配置，95 项保持全绿

## v1.2.0 - 2026-08-07

**AI 讲解模块**

- OpenAI 兼容 API 封装：chatCompletion、配置 localStorage 持久化、讲解 prompt 构造
- 全局 AI 对话悬浮窗：多轮对话、预设快捷指令、上下文注入
- 刷题页「AI 讲解」一键带入当前题目上下文
- 设置页 API 配置：baseURL / API Key / 模型 / temperature / 测试连接
- 测试扩展至 95 项

## v1.1.0 - 2026-08-07

**刷题核心链路 + 本地持久化**

- IndexedDB 本地存储：study_record / wrong_book / progress 三表，Promise 封装 + 无 IndexedDB 安全降级
- 判分纯函数：选择题精确匹配、填空题容错归一化（空格/大小写/±/π/LaTeX）
- 刷题页真实做题：三题型交互、KaTeX 公式渲染、提交判分、解析折叠展开、收藏、错题自动收录
- 解答题自评对错：查看答案后自评，答错自动入错题本
- 章节页接入真实进度：已做/错题/完成度 + 三色状态动态驱动
- 测试扩展至 63 项（judge / db / katex / practice-view 组件测试）

## v1.0.0 - 2026-08-07

**首个正式版本（高数学习助手 · 基础篇 MVP 起点）**

- 初始化 Vue 3 + Vite + TypeScript 纯前端单页应用骨架（hash 路由、底部 Tab/桌面侧边栏、全局设计系统、KaTeX 预留）
- 落地双 Agent 工作流基础设施：`.agent-workflow` 状态机、`orchestrator.sh` / `orchestrator_auto.sh`、`tools/` 测试脚本
- 题库数据层：题目类型契约（`types/question.ts`）、校验工具（`data/validate.ts`）、第一章章节结构（`data/chapters.ts`）、7 道样本题（`data/questionBank.ts`）
- 章节列表页：章→节目录折叠、题目数/进度展示、三色状态、跳转刷题页
- 刷题页：从路由读取章/节并显示该节题数（占位，下一轮实现判分链路）
- 测试套件：vitest 14 项（题库结构 + 校验器）+ vue-tsc 类型检查
