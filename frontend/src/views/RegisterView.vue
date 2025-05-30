<script setup>
import {reactive} from "vue";
import {useAuthStore} from "@/stores/useAuthStore.js";
import {useToast} from "vue-toastification";
import {useRouter} from "vue-router";

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const state = reactive({
  name: '',
  username: '',
  password: '',
  password_confirmation: ''
});

async function registerHandler() {
  await auth.register({
    name: state.name,
    username: state.username,
    password: state.password,
    password_confirmation: state.password_confirmation,
  }).then((response) => {
    toast.success("Conta criado com sucesso. Faça Login.");
    setTimeout(() => {
      router.push({name: 'Login'});
    }, 5000);
  }).catch((error) => {
    console.log(error);
    if (error.response.status === 400) toast.error("Informe os dados corretamente.");
    else toast.error("Ocorreu um erro no servidor. Tente novamente mais tarde.");
  });
}
</script>
<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="bg-white rounded-2xl shadow-2xl w-96 lg:w-1/3 justify-center px-6 py-20 lg:px-8 mx-auto">
      <h1 class="text-gray-900 tracking-tight font-bold text-2xl text-center mb-3">Cadastre-se para começar a
        conversar.</h1>
      <form @submit.prevent="registerHandler" class="flex flex-col p-2">
        <input id="name" v-model="state.name" type="text" placeholder="Nome"/>
        <input id="username" v-model="state.username" type="text" placeholder="Usuário"/>
        <input id="password" v-model="state.password" type="password" placeholder="Senha"/>
        <input id="password_confirmation" v-model="state.password_confirmation" type="password"
               placeholder="Confirmação de Senha"/>
        <button id="submit-btn" type="submit">Cadastrar</button>
        <h2 class="text-gray-900 text-center text-sm">
          Já tem uma conta?
          <RouterLink to="/login">Faça login aqui!</RouterLink>
        </h2>
      </form>
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
