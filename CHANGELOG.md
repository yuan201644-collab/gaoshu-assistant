# Changelog

## v1.0.0 - 2026-08-07

**首个正式版本（高数学习助手 · 基础篇 MVP 起点）**

- 初始化 Vue 3 + Vite + TypeScript 纯前端单页应用骨架（hash 路由、底部 Tab/桌面侧边栏、全局设计系统、KaTeX 预留）
- 落地双 Agent 工作流基础设施：`.agent-workflow` 状态机、`orchestrator.sh` / `orchestrator_auto.sh`、`tools/` 测试脚本
- 题库数据层：题目类型契约（`types/question.ts`）、校验工具（`data/validate.ts`）、第一章章节结构（`data/chapters.ts`）、7 道样本题（`data/questionBank.ts`）
- 章节列表页：章→节目录折叠、题目数/进度展示、三色状态、跳转刷题页
- 刷题页：从路由读取章/节并显示该节题数（占位，下一轮实现判分链路）
- 测试套件：vitest 14 项（题库结构 + 校验器）+ vue-tsc 类型检查
