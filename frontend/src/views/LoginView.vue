<script setup>
import {reactive} from "vue";
import {useAuthStore} from "@/stores/useAuthStore.js";
import {useToast} from "vue-toastification";
import {useRouter} from "vue-router";

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const state = reactive({
  username: '',
  password: '',
});

async function loginHandler() {
  await auth.login({
    username: state.username,
    password: state.password,
  }).then(() => {
    router.push({name: 'Home'});
  }).catch((error) => {
    if (error.response.status === 401) toast.error("Usuário ou senha incorretos. Tente novamente.");
    else toast.error("Ocorreu um erro no servidor. Tente novamente mais tarde.");
  });
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center ">
    <div class="bg-white rounded-2xl shadow-2xl w-96 lg:w-1/3 justify-center px-6 py-20 lg:px-8 mx-auto">
      <h1 class="text-gray-900 tracking-tight font-bold text-2xl text-center mb-3">Faça login na sua conta</h1>
      <form @submit.prevent="loginHandler" class="flex flex-col p-2">
        <input id="username" v-model="state.username" type="text" placeholder="usuário"/>
        <input id="password" v-model="state.password" type="password" placeholder="senha"/>
        <button id="submit-btn" type="submit">Entrar</button>
      </form>
      <h2 class="text-gray-900 text-center text-sm">
        Não tem uma conta?
        <RouterLink to="/register">Cadastre-se aqui!</RouterLink>
      </h2>
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
