import type { AxiosError } from 'axios';
import { useToast } from 'vue-toastification';

const toast = useToast();

interface ErrorResponse {
  success: boolean;
  message: string;
  errors: object | null;
}

export function handleApiError(error: unknown, defaultMessage: string): boolean {
  const err = error as AxiosError;
  toast.clear();

  if (err.response?.data) {
    const responseData = err.response.data as ErrorResponse;

    if (responseData.message) {
      toast.error(responseData.message);
    }
  } else {
    toast.error(defaultMessage);
  }

  return false;
}
