# Changelog

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
