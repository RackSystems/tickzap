<script setup lang="ts">
import { ref } from 'vue';
import IconLoading from '@/components/Icons/IconLoading.vue';
import { useAuthStore } from '@/features/auth/useAuthStore';
import IconMenu from '@/components/Icons/IconMenu.vue';
import IconNotifications from '@/components/Icons/IconNotifications.vue';
import IconClose from '@/components/Icons/IconClose.vue';

const auth = useAuthStore();

const isLoading = ref<boolean>(false);
const mobileMenuOpen = ref<boolean>(false);

const toggleMobileMenu = (): void => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

async function logoutHandler(): Promise<void> {
  isLoading.value = true;

  await auth.logout();

  isLoading.value = false;
}
</script>

<template>
  <div class="min-h-screen flex flex-col h-screen background">

    <!-- Mobile Menu Drawer -->
    <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-y-0 left-0 w-64 bg-gray-50 shadow-lg z-50 p-5 flex flex-col justify-between">
      <div class="flex flex-col gap-5">
        <div class="flex justify-between items-center">
          <RouterLink to="/" @click="toggleMobileMenu">
            <img src="@/assets/logo.png" alt="Tickzap" class="w-24" />
          </RouterLink>

          <button class="btn btn-ghost btn-sm" @click="toggleMobileMenu">
            <IconClose />
          </button>
        </div>

        <ul class="menu menu-lg menu-vertical w-full">
          <li>
            <RouterLink to="/" @click="toggleMobileMenu">
              Home
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/" @click="toggleMobileMenu">
              Chats
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/canais" @click="toggleMobileMenu">
              Canais
            </RouterLink>
          </li>
        </ul>
      </div>

      <footer class="text-center text-sm text-gray-500 py-4 mt-6 border-t">
        © 2025 Rack Systems
      </footer>
    </div>

    <div class="w-full pt-2 px-4 md:px-6" id="navbar">
      <header class="navbar p-3 flex w-full items-center justify-between text-gray-900 bg-gray-50 shadow-lg rounded-full">
        <div class="navbar-start">
          <div class="flex-none lg:hidden">
            <button class="btn btn-square btn-ghost" @click="toggleMobileMenu">
              <IconMenu />
            </button>
          </div>

          <div class="hidden lg:flex">
            <ul class="menu menu-lg menu-horizontal">
              <li>
                <RouterLink to="/">Home</RouterLink>
              </li>
              <li>
                <RouterLink to="/">Chats</RouterLink>
              </li>
              <li>
                <RouterLink to="/canais">Canais</RouterLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="navbar-center">
          <RouterLink to="/">
            <img src="@/assets/logo.png" alt="Tickzap" class="w-28 lg:w-32 hover:animate-pulse" />
          </RouterLink>
        </div>

        <div class="navbar-end gap-2 md:gap-4 space-x-4 px-5">
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle relative cursor-pointer">
              <IconNotifications class="text-gray-600" />
              <div class="absolute -top-1 -right-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
            </label>

            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-72">
              <li class="font-medium px-4 py-2 border-b">Notificações</li>
              <li><a class="flex items-center gap-2 py-3"><span class="text-blue-500">●</span>Teste</a></li>
            </ul>
          </div>

          <div class="dropdown dropdown-end">
            <label tabindex="0" class="indicator">
              <span class="indicator-item status status-success"></span>
              <img src="https://avatars.githubusercontent.com/u/104804099?v=4"
                   alt="Name"
                   class="w-8 sm:w-10 md:w-12 rounded-full"
              />
            </label>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-36">
              <li>
                <button>Meu Perfil</button>
              </li>

              <li>
                <button @click="logoutHandler" :disabled="isLoading">
                  <IconLoading class="animate-spin h-5 w-5" v-if="isLoading" />
                  Sair
                </button>
              </li>

              <li>
                <details open>
                  <summary>Status</summary>
                    <ul>
                      <li><button>Online</button></li>
                      <li><button>Ocupado</button></li>
                      <li><button>Ausente</button></li>
                      <li><button>Offline</button></li>
                    </ul>
                  </details>
              </li>

            </ul>
          </div>
        </div>
      </header>
    </div>

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>

    <footer class="footer footer-center text-center text-sm text-gray-500 py-4 hidden lg:block">
      © 2025 Rack Systems
    </footer>
  </div>
</template>
