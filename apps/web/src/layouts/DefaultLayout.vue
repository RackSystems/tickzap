<script setup lang="ts">
import {ref, computed, onMounted, onUpdated, watch} from 'vue'
import IconLoading from '@/components/Icons/IconLoading.vue';
import {useAuthStore} from '@/features/auth/useAuthStore';
import IconMenu from '@/components/Icons/IconMenu.vue';
import IconNotifications from '@/components/Icons/IconNotifications.vue';
import IconClose from '@/components/Icons/IconClose.vue';
import UserService from "@/features/auth/services/UserService";
import {handleApiError} from "@/api/handleApiError";
import {useInactivityMonitor} from "@/composables/useInactivityMonitor";

const auth = useAuthStore();

const isLoading = ref<boolean>(false);
const mobileMenuOpen = ref<boolean>(false);

const statuses = [
  {text: 'Online', value: 'online', color: 'success'},
  {text: 'Ocupado', value: 'busy', color: 'error'},
  {text: 'Ausente', value: 'away', color: 'warning'},
  {text: 'Offline', value: 'offline', color: 'neutral'},
  {text: 'Ocioso', value: 'idle', color: 'info'}
];

const statusColor = computed(() => {
  const status = statuses.find(s => s.value === currentStatus.value);
  return status ? `status-${status.color}` : 'status-neutral';
});

const currentStatus = computed(() => auth.user?.status || 'offline');

const IDLE_TIMEOUT_SECONDS = 300
const OFFLINE_TIMEOUT_MINUTES = 15
const { isUserActive, inactiveMinutes } = useInactivityMonitor(1000, IDLE_TIMEOUT_SECONDS);

onMounted(() => {
  console.log('STATUS ', currentStatus.value);
  console.log('is user active ', isUserActive)
});

onUpdated(() => {
  console.log('STATUS (updated): ', currentStatus.value);
  console.log('is user active (updated): ', isUserActive)
});

watch(isUserActive, (isActive: boolean) => {
  if (!auth.user) return;
  const isCurrentlyIdle = currentStatus.value === 'idle';
  const isCurrentOnline = currentStatus.value === 'online';
  if (isActive && !isCurrentOnline) {
    changeStatus('online');
  } else if (!isActive && !isCurrentlyIdle) {
    changeStatus('idle');
  }
});

watch(inactiveMinutes, (minutes: number) => {
  if (!auth.user) return;
  const isCurrentlyOffline = currentStatus.value === 'offline';
  if (minutes >= OFFLINE_TIMEOUT_MINUTES && !isCurrentlyOffline) {
    changeStatus('offline');
  }
});

async function changeStatus(status: string) {
  const oldStatus = currentStatus.value;
  try {
    if (!auth.user) {
      return;
    }
    const response = await UserService.updateStatus(auth.user.id, status);
    auth.user.status = response.status;
  } catch (error) {
    return handleApiError(error, 'Oops! Ocorreu um erro ao alterar status.');
  }
  console.info(`STATUS (changed) ${oldStatus} to: `, currentStatus.value);
}

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
    <div v-if="mobileMenuOpen"
         class="lg:hidden fixed inset-y-0 left-0 w-64 bg-gray-50 shadow-lg z-50 p-5 flex flex-col justify-between">
      <div class="flex flex-col gap-5">
        <div class="flex justify-between items-center">
          <RouterLink to="/" @click="toggleMobileMenu">
            <img src="/images/logo.png" alt="Tickzap" class="w-24"/>
          </RouterLink>

          <button class="btn btn-ghost btn-sm" @click="toggleMobileMenu">
            <IconClose/>
          </button>
        </div>

        <ul class="menu menu-lg menu-vertical w-full">
          <li>
            <RouterLink to="/" @click="toggleMobileMenu">
              Home
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/tickets" @click="toggleMobileMenu">
              Tickets
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/canais" @click="toggleMobileMenu">
              Canais
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/agentes" @click="toggleMobileMenu">
              Agentes
            </RouterLink>
          </li>
        </ul>
      </div>

      <footer class="text-center text-sm text-gray-500 py-4 mt-6 border-t">
        © 2025 Rack Systems
      </footer>
    </div>

    <div class="w-full pt-2 px-4 md:px-6" id="navbar">
      <header
          class="navbar p-3 flex w-full items-center justify-between text-gray-900 bg-gray-50 shadow-lg rounded-full">
        <div class="navbar-start">
          <div class="flex-none lg:hidden">
            <button class="btn btn-square btn-ghost" @click="toggleMobileMenu">
              <IconMenu/>
            </button>
          </div>

          <div class="hidden lg:flex">
            <ul class="menu menu-lg menu-horizontal">
              <li>
                <RouterLink to="/">Home</RouterLink>
              </li>
              <li>
                <RouterLink to="/tickets">Tickets</RouterLink>
              </li>
              <li>
                <RouterLink to="/canais">Canais</RouterLink>
              </li>
              <li>
                <RouterLink to="/agentes">Agentes</RouterLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="navbar-center">
          <RouterLink to="/">
            <img src="/images/logo.png" alt="Tickzap" class="w-28 lg:w-32 hover:animate-pulse"/>
          </RouterLink>
        </div>

        <div class="navbar-end gap-2 md:gap-4 space-x-4 px-5">
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle relative cursor-pointer">
              <IconNotifications class="text-gray-600"/>
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
              <span class="indicator-item status" :class="statusColor"></span>
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
                  <IconLoading class="animate-spin h-5 w-5" v-if="isLoading"/>
                  Sair
                </button>
              </li>

              <li>
                <details open>
                  <summary>Status</summary>
                  <ul v-for="status in statuses" :key="status.value">
                    <li>
                      <button @click="changeStatus(status.value)">
                        {{ status.text }}
                      </button>
                    </li>
                  </ul>
                </details>
              </li>

            </ul>
          </div>
        </div>
      </header>
    </div>

    <main class="flex-1 container mx-auto pt-6 pb-2">
      <slot/>
    </main>

    <footer class="footer footer-center text-center text-sm text-gray-500 py-4 hidden lg:block">
      © 2025 Rack Systems
    </footer>
  </div>
</template>
