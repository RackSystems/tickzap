<script setup lang="ts">
import IconLoading from '@/components/Icons/IconLoading.vue';
import { reactive, ref } from 'vue';
import { channelService } from '@/features/channels/service';
import BaseModal from '@/components/BaseModal.vue';

const modalBase = ref<InstanceType<typeof BaseModal> | null>(null);

const state = reactive<{
  currentChannelId: string;
  QRCode: string;
  isLoading: boolean;
}>({
  currentChannelId: '',
  QRCode: '',
  isLoading: false,
});

async function fetchQRCode(): Promise<void> {
  state.isLoading = true;

  const response = await channelService.connect(state.currentChannelId);
  state.QRCode = response.base64;

  state.isLoading = false;
}

async function open(channelId: string): Promise<void> {
  state.currentChannelId = channelId;
  modalBase.value?.open();
  await fetchQRCode();
}

defineExpose({ open });
</script>

<template>
  <BaseModal ref="modalBase" title="QR Code do Canal">
    <div class="py-8 flex flex-col items-center">
      <IconLoading v-if="state.isLoading" color="#000000" />

      <div class="bg-gray-100 w-52 h-52 flex items-center justify-center" v-else>
        <img :src="state.QRCode" alt="QR Code" class="w-full h-full" />
      </div>
    </div>

    <div class="modal-action">
      <button class="btn" @click="fetchQRCode" :disabled="state.isLoading">
        <IconLoading :disable-animate="true" color="#000000" />
      </button>
    </div>
  </BaseModal>
</template>
