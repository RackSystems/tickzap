<script setup lang="ts">
import { ref } from 'vue';
import { ErrorMessage, Field, Form } from 'vee-validate';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'next': [];
}>();

const formRef = ref<InstanceType<typeof Form> | null>(null);

function handleSubmit(): void {
  if (props.modelValue.trim().length >= 3) {
    emit('next');
  }
}

function validateAndNext(): void {
  if (formRef.value && props.modelValue.trim().length >= 3) {
    const formElement = formRef.value.$el as HTMLFormElement;
    if (formElement) {
      formElement.requestSubmit();
    }
  }
}

defineExpose({ validateAndNext });
</script>

<template>
  <Form 
    ref="formRef"
    @submit.prevent="handleSubmit" 
    class="space-y-4"
  >
    <div class="form-control">
      <Field
        name="name"
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        placeholder="Ex: Assistente Virtual, Suporte Tech, Bot de Vendas..."
        rules="required|min:3"
        class="input input-bordered w-full text-lg"
      />
      <ErrorMessage name="name" class="text-error text-sm mt-1" />
      <label class="label">
        <span class="label-text-alt text-gray-500">
          Este ser? o nome que o agente usar? para se apresentar aos usu?rios
        </span>
      </label>
    </div>
  </Form>
</template>
