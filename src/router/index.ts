import { createRouter, createWebHashHistory } from 'vue-router'

export const tabs = [
  { path: '/', label: '首页' },
  { path: '/chapters', label: '章节' },
  { path: '/knowledge', label: '知识' },
  { path: '/wrong-book', label: '错题' },
  { path: '/settings', label: '设置' },
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
