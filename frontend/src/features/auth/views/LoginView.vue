<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useRouter } from 'vue-router';
import type { Credentials } from '@/features/auth/types';
import { ErrorMessage, Field, Form } from 'vee-validate';
import AuthLayout from '@/features/auth/components/AuthLayout.vue';
import IconLoading from '@/components/Icons/IconLoading.vue';

const router = useRouter();
const auth = useAuthStore();

const isLoading = ref<boolean>(false);

const form = reactive<Credentials>({
  email: '',
  password: '',
});

async function loginHandler(): Promise<void> {
  isLoading.value = true;

  const response = await auth.login({
    email: form.email,
    password: form.password,
  });

  if (response && auth.isLoggedIn) {
    await router.push({ name: 'Home' });
  }

  isLoading.value = false;
}
</script>

<template>
  <AuthLayout>
    <h1 class="text-gray-900 tracking-tight text-2xl text-center mb-3">Faça login na sua conta</h1>

    <Form @submit="loginHandler" class="flex flex-col p-2">
      <Field name="email" v-model="form.email" placeholder="E-mail" rules="email|required" />
      <ErrorMessage name="email" class="ml-2 mb-2 text-sm text-red-500" />

      <Field name="password" v-model="form.password" type="password" placeholder="Senha" rules="required" />
      <ErrorMessage name="password" class="ml-2 mb-2 text-sm text-red-500" />

      <button id="submit-btn" type="submit" :disabled="isLoading">
        <IconLoading v-if="isLoading" class="mr-2" />
        Entrar
      </button>
    </Form>

    <h2 class="text-xs text-center">Esqueceu sua senha?
      <RouterLink to="/recuperar-senha" class="text-blue-600 hover:text-blue-900">Clique aqui</RouterLink>
    </h2>
  </AuthLayout>
</template>
