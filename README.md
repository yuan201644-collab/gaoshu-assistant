# 高数学习助手

个人高等数学学习助手（武忠祥《高等数学·基础篇》），纯前端单页应用，无后端依赖，数据本地存储，最终可通过 Capacitor 打包为安卓 APK。

## 技术栈

- Vue 3 + Vite + TypeScript
- Vue Router（hash 模式，适配 Capacitor `file://` 协议）
- Pinia（状态管理）
- KaTeX（数学公式渲染）
- Vitest（单元测试）+ vue-tsc（类型检查）

## 开发

```bash
npm install
npm run dev        # 启动开发服务器
npm run build      # 类型检查 + 生产构建
bash tools/run_all_tests.sh   # 跑全量测试
```

## 功能规划

- 学习仪表盘 / 章节列表 / 刷题 / 错题本 / 知识框架 / 设置 共 6 大页面
- AI 辅助讲解（OpenAI 兼容接口，可配置中转地址）
- 本地 IndexedDB 存储做题记录与错题本
- 函数绘图工具

> 本项目内容仅供个人学习使用。
