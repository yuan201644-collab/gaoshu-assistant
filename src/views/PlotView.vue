<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="page-full">
    <header class="plot-top">
      <button class="back-btn" @click="router.back()">‹ 返回</button>
      <span class="plot-title">函数绘图</span>
    </header>

    <div class="card">
      <div class="card-title">函数绘图工具（开发中）</div>
      <p class="placeholder">function-plot · 表达式输入 · 缩放平移</p>
    </div>
  </div>
</template>

<style scoped>
.plot-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.back-btn {
  color: var(--color-primary);
  font-size: 15px;
  padding: 8px 4px;
}

.plot-title {
  font-size: 17px;
  font-weight: 600;
}

.placeholder {
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
