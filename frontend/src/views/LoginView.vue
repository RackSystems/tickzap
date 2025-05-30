<script setup lang="ts">
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore.js';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();

interface LoginForm {
  email: string;
  password: string;
}

const state = reactive<LoginForm>({
  email: '',
  password: '',
});

async function loginHandler() {
  try {
    await auth.login({
      email: state.email,
      password: state.password,
    });

    router.push({ name: 'Home' });
  } catch (error) {
    const err = error as AxiosError;

    if (err.response?.status === 401) {
      toast.error('E-mail ou senha incorretos. Tente novamente.');
    } else {
      toast.error('Ocorreu um erro no servidor. Tente novamente mais tarde.');
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md lg:max-w-lg mx-auto">

      <img
        class="w-40 mb-4 ml-8"
        src="@/assets/logo.png"
        alt="Logo"
      />

      <div class="bg-white rounded-2xl shadow-2xl px-6 py-12">
        <h1 class="text-gray-900 tracking-tight text-2xl text-center mb-3">Faça login na sua conta</h1>
        <form @submit.prevent="loginHandler" class="flex flex-col p-2">
          <input id="email" v-model="state.email" type="email" placeholder="E-mail" />
          <input id="password" v-model="state.password" type="password" placeholder="Senha" />
          <button id="submit-btn" type="submit">Entrar</button>
        </form>
        <h2 class="text-xs text-center">Esqueceu sua senha?
          <RouterLink to="/esqueci-senha">Clique aqui</RouterLink>
        </h2>
      </div>

    </div>
  </div>
</template>

<style scoped>
form input {
  @apply p-2 bg-gray-100 rounded-md m-2 border-0
  text-gray-900 placeholder:text-gray-500 shadow-inner ring-1 ring-gray-300 sm:text-sm sm:leading-6
}

form button {
  @apply p-2 bg-blue-600 rounded-md mx-2 mt-4 mb-7 hover:bg-blue-500 leading-6 shadow-inner text-white transition duration-200
}
</style>
