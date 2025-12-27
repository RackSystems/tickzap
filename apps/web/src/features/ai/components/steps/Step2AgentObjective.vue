<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: string;
  agentName: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const objectives = [
  { 
    value: 'customer-support', 
    label: 'Atendimento ao Cliente',
    description: 'Resolver d?vidas e problemas dos clientes de forma r?pida e eficiente',
    icon: '??'
  },
  { 
    value: 'sales', 
    label: 'Vendas',
    description: 'Ajudar na convers?o de leads e fechamento de vendas',
    icon: '??'
  },
  { 
    value: 'technical-support', 
    label: 'Suporte T?cnico',
    description: 'Fornecer assist?ncia t?cnica especializada para problemas complexos',
    icon: '??'
  },
  { 
    value: 'information', 
    label: 'Informa??es',
    description: 'Fornecer informa??es sobre produtos, servi?os e processos',
    icon: '??'
  },
  { 
    value: 'scheduling', 
    label: 'Agendamento',
    description: 'Agendar e gerenciar compromissos e reuni?es',
    icon: '??'
  },
];
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <button
        v-for="objective in objectives"
        :key="objective.value"
        @click="emit('update:modelValue', objective.value)"
        type="button"
        class="p-4 border-2 rounded-lg text-left transition-all hover:shadow-md"
        :class="
          modelValue === objective.value
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-primary/50'
        "
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl">{{ objective.icon }}</span>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 mb-1">
              {{ objective.label }}
            </h4>
            <p class="text-sm text-gray-600">
              {{ objective.description }}
            </p>
          </div>
          <div
            v-if="modelValue === objective.value"
            class="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
          >
            <svg
              class="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
