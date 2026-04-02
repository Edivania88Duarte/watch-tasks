import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      { path: 'tasks', name: 'tasks', component: () => import('../views/TasksView.vue') },
      {
        path: 'tasks/:id',
        name: 'task-detail',
        component: () => import('../views/TaskDetailView.vue'),
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('../views/CategoriesView.vue'),
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/ReportsView.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const needsAuth = to.matched.some((r) => r.meta.requiresAuth);
  if (needsAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'home' };
  }
  return true;
});

export default router;
