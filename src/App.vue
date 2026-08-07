<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { tabs } from '@/router'
import AiChat from '@/components/AiChat.vue'

const route = useRoute()
const hideTab = computed(() => route.meta.hideTab === true)
</script>

<template>
  <div class="app-shell">
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AiChat />
    <nav v-if="!hideTab" class="app-tab" aria-label="主导航">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="app-tab-item"
        :class="{ 'is-active': route.path === tab.path }"
      >
        <svg
          class="app-tab-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="tab.icon" />
        </svg>
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
  z-index: var(--z-tab);
  display: flex;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
}

.app-tab-item {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 0 7px;
  color: var(--color-text-subtle);
  text-decoration: none;
  font-size: 11px;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s ease, transform 0.12s ease;
}

.app-tab-item:active {
  transform: scale(0.94);
}

.app-tab-item.is-active {
  color: var(--color-primary);
  font-weight: 600;
}

.app-tab-item.is-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--color-primary);
}

.app-tab-icon {
  width: 22px;
  height: 22px;
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
    flex-direction: row;
    gap: 10px;
    padding: 16px 24px;
    font-size: 15px;
  }

  .app-tab-item.is-active::before {
    top: 0;
    left: 0;
    right: auto;
    transform: none;
    width: 3px;
    height: 100%;
    border-radius: 0 3px 3px 0;
  }
}
</style>
