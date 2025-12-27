<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ChannelTypeLabels } from '@/features/channels/types';
import { channelService } from '@/features/channels/service';
import { ErrorMessage, Field, Form } from 'vee-validate';
import IconLoading from '@/components/Icons/IconLoading.vue';
import BaseModal from '@/components/BaseModal.vue';

const isLoading = ref<boolean>(false);
const modalBase = ref<InstanceType<typeof BaseModal> | null>(null);

const form = reactive({
  name: '',
  type: '',
  identifier: '',
});

const emit = defineEmits<{
  (e: 'channelCreated'): void
}>();

async function submitHandler(): Promise<void> {
  isLoading.value = true;

  try {
    await channelService.create({
      name: form.name,
      type: form.type,
      identifier: form.identifier,
    });

    form.name = '';
    form.type = '';
    form.identifier = '';
    
    modalBase.value?.close();
    emit('channelCreated');
  } finally {
    isLoading.value = false;
  }
}

function open(): void {
  modalBase.value?.open();
}

defineExpose({ open });
</script>

<template>
  <BaseModal ref="modalBase" title="Criar Novo Canal">
    <Form @submit="submitHandler">
      <Field
        name="name"
        v-model="form.name"
        placeholder="Nome"
        rules="required"
      />
      <ErrorMessage name="name" class="error-message" />

      <Field
        as="select"
        name="type"
        rules="required"
        v-model="form.type"
      >
        <option disabled selected value="">Selecione um tipo</option>
        <option v-for="(label, type) in ChannelTypeLabels" :key="type" :value="type">
          {{ label }}
        </option>
      </Field>
      <ErrorMessage name="type" class="error-message" />
      
      <Field
        name="identifier"
        v-model="form.identifier"
        placeholder="Identificador"
        rules="required"
      />
      <ErrorMessage name="identifier" class="error-message" />

      <button type="submit" :disabled="isLoading" class="flex justify-center items-center">
        <IconLoading v-if="isLoading" class="mr-2" />
        Criar
      </button>
    </Form>
  </BaseModal>
</template>
