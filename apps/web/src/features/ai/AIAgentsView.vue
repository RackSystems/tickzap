<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { type AIAgent } from './types';
import CreateAgentModal from './components/CreateAgentModal.vue';
import IconDelete from '@/components/Icons/IconDelete.vue';
import IconLoading from '@/components/Icons/IconLoading.vue';
import { formatDate } from '@/utils/date';

const state = reactive<{
  agents: AIAgent[];
  isLoading: boolean;
}>({
  agents: [],
  isLoading: false,
});

const createModal = ref<InstanceType<typeof CreateAgentModal> | null>(null);

async function list(): Promise<void> {
  state.isLoading = true;
  // TODO: Implementar chamada ao servi?o
  // state.agents = await aiAgentService.list();
  state.isLoading = false;
}

function handleAgentCreated(): void {
  list();
}

onMounted(list);
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Agentes</h1>

    <button
      @click="createModal?.open()"
      class="bg-blue-700 hover:bg-blue-600 px-4 py-2 text-white rounded-md transition duration-200 flex items-center"
    >
      Criar Agente
    </button>
  </div>

  <!-- Agents List -->
  <div class="mt-6">
    <div v-if="state.isLoading" class="flex justify-center items-center h-64 text-blue-600">
      <IconLoading />
    </div>

    <div v-else-if="!state.agents || state.agents.length === 0" class="bg-gray-50 rounded-lg shadow-lg p-8 text-center">
      <p class="text-gray-900">Nenhum agente encontrado</p>
      <p class="text-gray-500 text-sm mt-2">Clique em "Criar Agente" para adicionar um novo agente IA</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Agent Card -->
      <div
        v-for="agent in state.agents"
        :key="agent.id"
        class="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <div class="p-5">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ agent.name }}</h3>
            <span
              class="px-2 py-1 text-xs font-semibold rounded-full"
              :class="agent.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            >
              {{ agent.isActive ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <p class="text-xs text-gray-900 mb-3">
            <span class="text-gray-400">Modelo: </span>
            {{ agent.model }}
          </p>

          <p v-if="agent.createdAt" class="text-xs text-gray-900 mb-3">
            <span class="text-gray-400">Criado em: </span>
            {{ formatDate(agent.createdAt) }}
          </p>

          <!-- Buttons -->
          <div class="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
            <button
              class="text-red-500 hover:text-red-400 p-2 rounded-full transition hover:bg-gray-200"
              title="Excluir agente"
            >
              <IconDelete />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Agent Modal -->
  <CreateAgentModal ref="createModal" @agentCreated="handleAgentCreated" />
</template>
