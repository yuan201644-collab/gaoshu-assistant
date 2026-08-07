import { createRouter, createWebHashHistory } from 'vue-router'

export const tabs = [
  { path: '/', label: '首页', icon: 'M3 10.5 12 3l9 7.5M5 9.2V21h14V9.2' },
  { path: '/chapters', label: '章节', icon: 'M4 6h16M4 12h16M4 18h16' },
  { path: '/knowledge', label: '知识', icon: 'M12 4v5M12 9c-2.8 0-5 2.2-5 5v6M12 9c2.8 0 5 2.2 5 5v6M7 15h10' },
  { path: '/wrong-book', label: '错题', icon: 'M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5zM8 9h8M8 13h5' },
  { path: '/settings', label: '设置', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/chapters', name: 'chapters', component: () => import('@/views/ChapterListView.vue') },
    {
      path: '/practice/:cid/:sid',
      name: 'practice',
      component: () => import('@/views/PracticeView.vue'),
      meta: { hideTab: true },
    },
    { path: '/wrong-book', name: 'wrong-book', component: () => import('@/views/WrongBookView.vue') },
    { path: '/knowledge', name: 'knowledge', component: () => import('@/views/KnowledgeMapView.vue') },
    {
      path: '/plot',
      name: 'plot',
      component: () => import('@/views/PlotView.vue'),
      meta: { hideTab: true },
    },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
