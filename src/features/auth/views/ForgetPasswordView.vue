<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { PasswordRecoveryRequest } from '@/features/auth/types';
import { ErrorMessage, Field, Form } from 'vee-validate';
import AuthLayout from '@/features/auth/components/AuthLayout.vue';
import IconLoading from '@/components/Icons/IconLoading.vue';

const auth = useAuthStore();

const success = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const form = reactive<PasswordRecoveryRequest>({
  email: '',
});

async function recoverPasswordHandler(): Promise<void> {
  isLoading.value = true;

  const response = await auth.recoverPassword(form);

  if (response) {
    success.value = true;
  }

  isLoading.value = false;
}
</script>

<template>
  <AuthLayout>
    <h1 class="text-gray-900 tracking-tight text-2xl text-center mb-3">Recuperar senha</h1>

    <Form v-if="!success" @submit="recoverPasswordHandler" class="flex flex-col p-2">
      <Field name="email" v-model="form.email" placeholder="E-mail" rules="email|required" />
      <ErrorMessage name="email" class="ml-2 mb-2 text-sm text-red-500" />

      <button id="submit-btn" type="submit" :disabled="isLoading" class="flex justify-center items-center">
        <IconLoading v-if="isLoading" class="mr-2" />
        Enviar código de recuperação
      </button>
    </Form>

    <div v-else class="py-10 text-center">
      <p class="text-green-500 text-lg font-medium mb-2">Código de recuperação enviado com sucesso!</p>
      <RouterLink to="/login" class="text-blue-600 hover:text-blue-900">Voltar para o login</RouterLink>
    </div>

    <h2 class="text-xs text-center mt-4" v-if="!success">
      Lembrou sua senha?
      <RouterLink to="/login" class="text-blue-600 hover:text-blue-900">Voltar para o login</RouterLink>
    </h2>
  </AuthLayout>
</template>
