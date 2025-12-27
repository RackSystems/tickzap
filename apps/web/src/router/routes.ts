import type { RouteRecordRaw } from 'vue-router';
import type { RouteMetaCustom } from '@/router/types';

export const routes: Array<RouteRecordRaw & { meta: RouteMetaCustom }> = [
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
    path: '/tickets',
    name: 'Tickets',
    component: () => import('@/features/tickets/ChatView.vue'),
    meta: {
      auth: true,
      title: 'Tickets',
    },
  },

  {
    path: '/agentes',
    name: 'AIAgents',
    component: () => import('@/features/ai/AIAgentsView.vue'),
    meta: {
      auth: true,
      title: 'Agentes',
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
