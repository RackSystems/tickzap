<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useRoute } from 'vue-router';
import { ErrorMessage, Field, Form } from 'vee-validate';
import AuthLayout from '@/features/auth/components/AuthLayout.vue';
import IconLoading from '@/components/Icons/IconLoading.vue';
import type { PasswordResetRequest } from '@/features/auth/types';

const route = useRoute();
const auth = useAuthStore();

const isLoading = ref<boolean>(false);
const success = ref<boolean>(false);

const token: string = route.query.token as string || '';

const form = reactive<PasswordResetRequest>({
  token: token.value,
  password: '',
  password_confirmation: '',
});

async function resetPasswordHandler(): Promise<void> {
  isLoading.value = true;

  const response = await auth.resetPassword(form);

  if (response) {
    success.value = true;
  }

  isLoading.value = false;
}
</script>

<template>
  <AuthLayout>
    <h1 class="text-gray-900 tracking-tight text-2xl text-center mb-3">Redefinir senha</h1>

    <Form @submit="resetPasswordHandler" v-if="token" class="flex flex-col p-2">
      <Field name="password" v-model="form.password" type="password" placeholder="Nova senha" rules="required|min:8" />
      <ErrorMessage name="password" class="ml-2 mb-2 text-sm text-red-500" />

      <Field name="password_confirmation"
             v-model="form.password_confirmation"
             type="password"
             placeholder="Confirme a nova senha"
             rules="required|confirmed:@password"
      />
      <ErrorMessage name="password_confirmation" class="ml-2 mb-2 text-sm text-red-500" />

      <button id="submit-btn" type="submit" :disabled="isLoading" class="flex justify-center items-center">
        <IconLoading v-if="!isLoading" class="mr-2" />
        Redefinir senha
      </button>
    </Form>

    <div v-else-if="success" class="py-10 text-center">
      <p class="text-green-500 text-lg font-medium mb-2">Senha redefinida com sucesso!</p>
      <p class="text-gray-700">Você pode agora fazer login com sua nova senha.</p>
      <RouterLink to="/login" class="text-blue-600 hover:text-blue-800">Voltar para o login</RouterLink>
    </div>

    <div v-else class="py-10 text-center">
      <p class="text-red-500 text-lg font-medium mb-2">Link de recuperação inválido!</p>
      <p class="text-gray-700">O link que você utilizou expirou ou está incorreto.</p>
      <p class="text-gray-700">
        Você pode solicitar um novo link de recuperação
        <RouterLink to="/recuperar-senha" class="text-blue-600 hover:text-blue-800">clicando aqui.</RouterLink>
      </p>
    </div>

    <h2 class="text-xs text-center mt-4" v-if="!success">
      Lembrou sua senha?
      <RouterLink to="/login" class="text-blue-600 hover:text-blue-800">Voltar para o login</RouterLink>
    </h2>
  </AuthLayout>
</template>
