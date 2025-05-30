<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
</script>

<template>
  <div class="min-h-screen flex flex-col h-screen background">

    <div class="w-96 pt-2 lg:w-full px-6" id="navbar">
      <header class="navbar p-5 flex w-full items-center justify-between text-gray-900 bg-gray-50 shadow-lg rounded-full">
          <div class="navbar-start">
            <div class="flex-none">
              <button class="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
              </button>
            </div>
            <div class="flex-none">
              <ul class="menu menu-horizontal px-1">
                <li>
                  <RouterLink to="/">
                    Home
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/">
                    Chats
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/">
                    Canais
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>

          <div class="navbar-center">
            <RouterLink to="/">
              <img src="@/assets/logo.png" alt="Tickzap" class="w-24 hover:animate-pulse" />
            </RouterLink>
          </div>

          <div class="navbar-end gap-4">
            <button class="btn btn-ghost btn-circle">
              <div class="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                <span class="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>

            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                <div class="w-12 rounded-full">
                  <img src="https://avatars.githubusercontent.com/u/104804099?v=4" alt="Name" />
                </div>
              </label>
              <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-36">
                <li><a>Meu Perfil</a></li>
                <li><a>Desconectar</a></li>
              </ul>
            </div>
          </div>
      </header>
    </div>

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
