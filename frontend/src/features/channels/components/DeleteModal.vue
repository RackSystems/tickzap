<script setup lang="ts">
import IconLoading from '@/components/Icons/IconLoading.vue';
import { reactive, ref } from 'vue';
import BaseModal from '@/components/BaseModal.vue';

const modalBase = ref<InstanceType<typeof BaseModal> | null>(null);

const state = reactive<{
  currentChannelId: string;
  isLoading: boolean;
}>({
  currentChannelId: '',
  isLoading: false,
});

async function destroy(): Promise<void> {
  state.isLoading = true;

  setTimeout(() => {
    console.log('Destroying channel:', state.currentChannelId);
    modalBase.value?.close();
    state.isLoading = false;
  }, 1000);
}

async function open(channelId: string): Promise<void> {
  state.currentChannelId = channelId;
  modalBase.value?.open();
}

defineExpose({ open });
</script>

<template>
  <BaseModal ref="modalBase" title="Excluir Canal">
    <p class="py-4">Tem certeza que deseja excluir este canal? Esta ação não pode ser desfeita.</p>

    <div class="modal-action">
      <button @click="destroy" class="btn btn-error" :disabled="state.isLoading">
        <IconLoading v-if="state.isLoading" />
        Excluir
      </button>

      <button class="btn" @click="modalBase?.close()" :disabled="state.isLoading">Cancelar</button>
    </div>
  </BaseModal>
</template>
