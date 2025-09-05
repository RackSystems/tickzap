import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { routes } from '@/router/routes';

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
