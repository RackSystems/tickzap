import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '@/api/apiClient';
import type {
  Credentials,
  PasswordRecoveryRequest,
  PasswordResetRequest, RegisterRequest,
  User,
} from '@/features/auth/types';
import { useToast } from 'vue-toastification';
import { handleApiError } from '@/api/handleApiError';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast();
  const router = useRouter();

  const user = ref<User | null>(null);
  const isLoggedIn = computed<boolean>(() => !!user.value);

  const getUser = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/me');
      user.value = response.data.body as User;
    } catch (error) {
      toast.clear();
      toast.error('Oops! Ocorreu um erro ao tentar obter os dados do usuário.');
      user.value = null;
      console.error(error);
    }
  };

  const login = async (payload: Credentials): Promise<boolean> => {
    try {
      await apiClient.post('/login', payload);
      await getUser();

      return true;
    } catch (error) {
      return handleApiError(error, 'Oops! Ocorreu um erro ao tentar fazer login.');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
      user.value = null;
      localStorage.removeItem('auth');
      await router.push({ name: 'Login' });
    } catch (error) {
      toast.clear();
      toast.error('Oops! Ocorreu um erro ao tentar fazer logout.');
      console.error(error);
    }
  };

  const recoverPassword = async (payload: PasswordRecoveryRequest): Promise<boolean> => {
    try {
      await apiClient.post('/recover-password', payload);
      return true;
    } catch (error) {
      return handleApiError(error, 'Oops! Ocorreu um erro ao tentar recuperar a senha.');
    }
  };

  const resetPassword = async (payload: PasswordResetRequest): Promise<boolean> => {
    try {
      await apiClient.post('/reset-password', payload);
      return true;
    } catch (error) {
      return handleApiError(error, 'Oops! Ocorreu um erro ao tentar redefinir a senha.');
    }
  };

  const register = async (payload: RegisterRequest): Promise<boolean> => {
    try {
      await apiClient.post('/register', payload);
      return true;
    } catch (error) {
      return handleApiError(error, 'Oops! Ocorreu um erro ao tentar finalizar o cadastro.');
    }
  };

  return {
    user,
    isLoggedIn,
    getUser,
    login,
    logout,
    recoverPassword,
    resetPassword,
    register,
  };
}, { persist: true });
