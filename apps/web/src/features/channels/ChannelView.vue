<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { type Channel, ChannelTypeLabels } from './types';
import { channelService } from './service';
import IconQrCode from '@/features/channels/components/IconQrCode.vue';
import QRCodeModal from '@/features/channels/components/QRCodeModal.vue';
import DeleteModal from '@/features/channels/components/DeleteModal.vue';
import CreateModal from '@/features/channels/components/CreateModal.vue';
import IconDelete from '@/components/Icons/IconDelete.vue';
import IconLoading from '@/components/Icons/IconLoading.vue';
import { formatDate } from '@/utils/date';

const state = reactive<{
  channels: Channel[];
  isLoading: boolean;
}>({
  channels: [],
  isLoading: false,
});

const qrCodeModal = ref<InstanceType<typeof QRCodeModal> | null>(null);
const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null);
const createModal = ref<InstanceType<typeof CreateModal> | null>(null);

async function list(): Promise<void> {
  state.isLoading = true;
  state.channels = await channelService.list();
  state.isLoading = false;
}

onMounted(list);
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Canais</h1>

    <button
      @click="createModal?.open()"
      class="bg-blue-700 hover:bg-blue-600 px-4 py-2  text-white rounded-md transition duration-200 flex items-center"
    >
      Adicionar Canal
    </button>
  </div>

  <!-- Channels List -->
  <div class="mt-6">
    <div v-if="state.isLoading" class="flex justify-center items-center h-64 text-blue-600">
      <IconLoading />
    </div>

<!--    <div v-else-if="!state.channels || state.channels.length === 0" class="bg-gray-50 rounded-lg shadow-lg p-8 text-center">-->
<!--      <p class="text-gray-900">Nenhum canal encontrado</p>-->
<!--    </div>-->

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Channel Card -->
      <div
        v-for="channel in state.channels"
        :key="channel.id"
        class="bg-gray-50 rounded-lg overflow-hidden shadow-lg  hover:shadow-xl transition-shadow duration-300"
      >
        <div class="p-5">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ channel.name }}</h3>
            <span class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="channel.status === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
            >
                {{ channel.status }}
              </span>
          </div>

          <p class="text-xs text-gray-900 mb-3">
            <span class="text-gray-400">Tipo: </span>
            {{ ChannelTypeLabels[channel.type] }}
          </p>

          <p class="text-xs text-gray-900 mb-3">
            <span class="text-gray-400">Autenticação: </span>
            {{ channel.isAuthenticated }}
          </p>

          <p class="text-xs text-gray-900 mb-3">
            <span class="text-gray-400">Criado em: </span>
            {{ formatDate(channel.createdAt ?? '') }}
          </p>

          <!-- Buttons -->
          <div class="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
            <button
              @click="qrCodeModal?.open(channel.id)"
              class="text-gray-900 hover:text-gray-700 p-2 rounded-full transition hover:bg-gray-200"
            >
              <IconQrCode />
            </button>

            <button
              @click="deleteModal?.open(channel.id)"
              class="text-red-500 hover:text-red-400 p-2 rounded-full transition hover:bg-gray-200"
            >
              <IconDelete />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Channel Modal -->
  <CreateModal ref="createModal" @channel-created="list" />

  <!-- Delete Channel Modal -->
  <DeleteModal ref="deleteModal" @channel-deleted="list" />

  <!-- QR Code Modal -->
  <QRCodeModal ref="qrCodeModal" />
</template>
