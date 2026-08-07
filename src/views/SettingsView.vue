<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { loadAiConfig, saveAiConfig, chatCompletion, defaultAiConfig } from '@/services/ai'
import type { AiConfig } from '@/services/ai'

const form = reactive<AiConfig>({ ...defaultAiConfig() })
const hint = ref('')
const status = ref('')

onMounted(() => {
  Object.assign(form, loadAiConfig())
})

function save() {
  if (!form.apiKey.trim()) {
    hint.value = '请填写 API Key'
    status.value = ''
    return
  }
  hint.value = ''
  saveAiConfig({ ...form })
  status.value = '已保存'
}

async function testConnection() {
  hint.value = ''
  status.value = ''
  try {
    await chatCompletion([{ role: 'user', content: 'ping' }], { ...form })
    status.value = '连接成功'
  } catch (e) {
    status.value = (e as Error).message || '连接失败'
  }
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">设置</h1>
    <p class="page-sub">配置 AI 讲解 API</p>

    <div class="card">
      <div class="card-title">API 配置</div>

      <div class="form-row">
        <label class="form-label" for="ai-base-url">接口地址 BaseURL</label>
        <input
          id="ai-base-url"
          v-model="form.baseURL"
          class="form-input"
          type="text"
          placeholder="https://api.openai.com/v1"
        />
      </div>

      <div class="form-row">
        <label class="form-label" for="ai-api-key">API Key</label>
        <input
          id="ai-api-key"
          v-model="form.apiKey"
          class="form-input"
          type="password"
          placeholder="sk-..."
        />
      </div>

      <div class="form-row">
        <label class="form-label" for="ai-model">模型</label>
        <input
          id="ai-model"
          v-model="form.model"
          class="form-input"
          type="text"
          placeholder="gpt-4o-mini"
        />
      </div>

      <div class="form-row">
        <label class="form-label" for="ai-temperature">Temperature：{{ form.temperature }}</label>
        <input
          id="ai-temperature"
          v-model.number="form.temperature"
          class="form-range"
          type="range"
          min="0"
          max="1"
          step="0.1"
        />
      </div>

      <p v-if="hint" class="save-hint">{{ hint }}</p>
      <p v-if="status" class="save-status">{{ status }}</p>

      <div class="form-actions">
        <button class="btn btn-ghost btn-test" @click="testConnection">测试连接</button>
        <button class="btn btn-primary btn-save" @click="save">保存配置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.form-input,
.form-range {
  width: 100%;
}

.form-input {
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--color-surface);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.save-hint {
  color: var(--color-danger);
  font-size: 13px;
  margin-bottom: 10px;
}

.save-status {
  color: var(--color-success);
  font-size: 13px;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.form-actions .btn {
  flex: 1;
}
</style>
