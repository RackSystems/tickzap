import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { routes } from '@/router/routes';

const index = createRouter({
  history: createWebHistory('/'),
  routes,
});

index.beforeEach((to) => {
  document.title = 'Tickzap - ' + (to.meta.title ?? 'Home');

  const auth = useAuthStore();

  if (to.meta.auth && !auth.isLoggedIn) return { name: 'Login' };
  if (to.meta.auth === false && auth.isLoggedIn) return { name: 'Home' };
});

export default index;
