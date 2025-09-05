<script setup lang="ts">
import { reactive, ref } from 'vue';
import AuthLayout from '@/features/auth/components/AuthLayout.vue';
import { ErrorMessage, Field, Form } from 'vee-validate';
import IconLoading from '@/components/Icons/IconLoading.vue';
import type { RegisterRequest } from '@/features/auth/types';
import { useAuthStore } from '@/features/auth/useAuthStore';

const auth = useAuthStore;

const success = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const email: string = route.query.email as string || '';
const token: string = route.query.token as string || '';

const form = reactive<RegisterRequest>({
  name: '',
  password: '',
  password_confirmation: '',
  token: token,
});

async function registerHandler(): Promise<void> {
  isLoading.value = true;

  const response = await auth.register(form);

  if (response) {
    success.value = true;
  }

  isLoading.value = false;
}
</script>
<template>
  <AuthLayout>
    <h1 class="text-gray-900 tracking-tight text-2xl text-center mb-3">Finalize seu cadastro</h1>

    <Form v-if="token && email" @submit.prevent="registerHandler" class="flex flex-col p-2">
      <input name="email" v-model="email" type="email" placeholder="Email" disabled class="bg-gray-200 mb-2" />

      <Field name="name" v-model="form.name" type="text" placeholder="Nome" rules="required" />
      <ErrorMessage name="name" class="text-red-500 text-sm mb-2" />

      <Field name="password" v-model="form.password" type="new-password" placeholder="Senha" rules="required" />
      <ErrorMessage name="password" class="text-red-500 text-sm mb-2" />

      <Field name="password_confirmation"
             v-model="form.password_confirmation"
             type="new-password"
             placeholder="Confirmação de Senha"
             rules="required"
      />
      <ErrorMessage name="password_confirmation" class="text-red-500 text-sm mb-2" />

      <button name="submit-btn" type="submit" :disabled="isLoading">
        <IconLoading v-if="isLoading" class="mr-2" />
        Finalizar Cadastro
      </button>
    </Form>

    <div v-else-if="success" class="py-10 text-center">
      <p class="text-green-500 text-lg font-medium mb-2">Cadastro realizado com sucesso!</p>
      <p class="text-gray-700">Você pode agora fazer login com suas credenciais.</p>
      <RouterLink to="/login" class="text-blue-600 hover:text-blue-800">Voltar para o login</RouterLink>
    </div>

    <div v-else class="py-10 text-center">
      <p class="text-red-500 text-lg font-medium mb-2">Link de cadastro inválido!</p>
      <p class="text-gray-700">O link que você utilizou expirou ou está incorreto.</p>
      <p class="text-gray-700">Solicite um novo link de cadastro</p>
    </div>

    <h2 class="text-xs text-center" v-if="!success">
      Já tem uma conta?
      <RouterLink to="/login" class="text-blue-600 hover:text-blue-900">Faça login aqui!</RouterLink>
    </h2>
  </AuthLayout>
</template>
