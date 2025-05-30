import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

interface RouteMetaCustom {
  auth?: boolean;
  title?: string;
  layout?: 'default' | 'auth';
}

const routes: Array<RouteRecordRaw & { meta: RouteMetaCustom }> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      auth: true,
      title: 'Home',
    },
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      auth: false,
      title: 'Login',
      layout: 'auth',
    },
  },

  {
    path: '/recuperar-senha',
    name: 'ForgotPassword',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      auth: false,
      title: 'Recuperar Senha',
      layout: 'auth',
    },
  },


];

const index = createRouter({
  history: createWebHistory('/'),
  routes,
});

index.beforeEach((to, from, next) => {
  document.title = 'Tickzap - ' + (to.meta.title ?? 'Home');

  const auth = useAuthStore();

  if (to.meta.auth) {
    if (!auth.isLoggedIn) next({ name: 'Login' });
    else next();
  } else if (to.meta.auth === false) {
    if (auth.isLoggedIn) next({ name: 'Home' });
    else next();
  } else {
    next();
  }
});

export default index;
