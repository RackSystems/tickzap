import { defineRule } from 'vee-validate';

defineRule('required', (value: any): string | boolean => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'O campo é obrigatório.';
  }

  return true;
});

defineRule('email', (value: string): string | boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value || !regex.test(value)) {
    return 'O e-mail deve ser válido.';
  }

  return true;
});
