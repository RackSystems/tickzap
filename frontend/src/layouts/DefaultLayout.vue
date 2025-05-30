<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';

const auth = useAuthStore();
</script>

<template>
  <div class="min-h-screen flex flex-col h-screen">
    <header
      class="relative flex px-5 py-3 w-full items-center justify-between text-gray-300 hover:text-white duration-100">
      <RouterLink to="/">
        <img
          src="/images/logo.png"
          alt="Logo"
          class="w-20 hover:animate-pulse"
        />
      </RouterLink>

      <div v-if="auth.isLoggedIn" class="block">
        <span class="px-3">Bem-vindo, {{ auth.user?.name }}</span>
        <span
          class="bg-custom-blue text-white rounded-sm px-3 py-2.5 text-xs uppercase transition duration-200 hover:bg-gray-800 cursor-pointer"
          @click="logoutHandler"
        >
        DESCONECTAR
      </span>
      </div>
    </header>
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
