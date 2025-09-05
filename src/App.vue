<script setup lang="ts">
import { useRoute } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { computed } from 'vue';

const route = useRoute();

const layout = computed<typeof DefaultLayout | typeof AuthLayout>(() => {
  const type = route.meta.layout || 'default';

  return type === 'default'
    ? DefaultLayout
    : AuthLayout;
});
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
