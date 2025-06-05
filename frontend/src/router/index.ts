import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { RouteMetaCustom } from '@/router/types';

const routes: Array<RouteRecordRaw & { meta: RouteMetaCustom }> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/features/dashboard/DashboardView.vue'),
    meta: {
      auth: true,
      title: 'Home',
    },
  },

  {
    path: '/canais',
    name: 'Canais',
    component: () => import('@/features/channels/ChannelView.vue'),
    meta: {
      auth: true,
      title: 'Canais',
    },
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/views/LoginView.vue'),
    meta: {
      auth: false,
      title: 'Login',
      layout: 'auth',
    },
  },

  {
    path: '/cadastro',
    name: 'Register',
    component: () => import('@/features/auth/views/RegisterView.vue'),
    meta: {
      auth: false,
      title: 'Finalizar Cadastro',
      layout: 'auth',
    },
    props: true,
  },

  {
    path: '/recuperar-senha',
    name: 'ForgotPassword',
    component: () => import('@/features/auth/views/ForgetPasswordView.vue'),
    meta: {
      auth: false,
      title: 'Recuperar Senha',
      layout: 'auth',
    },
  },

  {
    path: '/nova-senha',
    name: 'no',
    component: () => import('@/features/auth/views/ResetPasswordView.vue'),
    meta: {
      auth: false,
      title: 'Nova Senha',
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
