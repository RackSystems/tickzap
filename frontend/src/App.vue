<script setup>
import {useAuthStore} from "@/stores/useAuthStore";
import {useToast} from "vue-toastification";
import {useRouter} from "vue-router";

const toast = useToast();
const router = useRouter();
const auth = useAuthStore();

async function logoutHandler() {
  await auth.logout().then(() => {
    router.push({name: 'Login'});
    toast.success("Desconectado.");
  });
}
</script>
<template>
  <div style="background-image: url('/images/background.jpg');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;"
       class="min-h-screen flex flex-col h-screen"
    >
    <header class="relative flex px-5 py-3 w-full items-center justify-between text-gray-300 hover:text-white duration-100">
      <RouterLink to="/">
        <div class="flex items-center gap-x-5">
          <img
              src="/images/logo.png"
              alt="Logo"
              class="w-12 hover:animate-pulse"
          />
          <span>WE ARE ALL FURIA.</span>
        </div>
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
      <RouterView/>
    </main>
  </div>
</template>
