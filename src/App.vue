<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { tabs } from '@/router'

const route = useRoute()
const hideTab = computed(() => route.meta.hideTab === true)
</script>

<template>
  <div class="app-shell">
    <main class="app-main">
      <router-view />
    </main>
    <nav v-if="!hideTab" class="app-tab" aria-label="主导航">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="app-tab-item"
        :class="{ 'is-active': route.path === tab.path }"
      >
        <span class="app-tab-label">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.app-tab {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
}

.app-tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 8px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 13px;
  -webkit-tap-highlight-color: transparent;
}

.app-tab-item.is-active {
  color: var(--color-primary);
  font-weight: 600;
}

@media (min-width: 769px) {
  .app-shell {
    flex-direction: row;
  }

  .app-main {
    max-width: none;
    margin-left: 200px;
    padding: 0 24px;
  }

  .app-tab {
    top: 0;
    right: auto;
    bottom: 0;
    width: 200px;
    flex-direction: column;
    border-top: none;
    border-right: 1px solid var(--color-border);
    padding-bottom: 0;
  }

  .app-tab-item {
    justify-content: flex-start;
    padding: 16px 24px;
    font-size: 15px;
  }
}
</style>
