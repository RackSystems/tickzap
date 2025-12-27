<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import IconLoading from '@/components/Icons/IconLoading.vue';
import IconBack from '@/components/Icons/IconBack.vue';
import BaseModal from '@/components/BaseModal.vue';
import Step1AgentName from './steps/Step1AgentName.vue';
import Step2AgentObjective from './steps/Step2AgentObjective.vue';

const isLoading = ref<boolean>(false);
const modalBase = ref<InstanceType<typeof BaseModal> | null>(null);
const currentStep = ref<number>(1);
const totalSteps = 2;
const step1Ref = ref<InstanceType<typeof Step1AgentName> | null>(null);

const form = reactive({
  name: '',
  objective: '',
});

const emit = defineEmits<{
  (e: 'agentCreated'): void
}>();

const stepTitle = computed(() => {
  if (currentStep.value === 1) {
    return 'Criar um novo agente';
  }
  return `Qual objetivo de ${form.name || 'A'}?`;
});

const stepDescription = computed(() => {
  if (currentStep.value === 1) {
    return 'Seja criativo, escolha o nome que seu agente vai usar para se apresentar.';
  }
  return 'Escolha o que melhor define o objetivo que seu agente vai ter.';
});

const canGoNext = computed(() => {
  if (currentStep.value === 1) {
    return form.name.trim().length >= 3;
  }
  return form.objective.trim().length > 0;
});

function handleStep1Next(): void {
  if (form.name.trim().length >= 3) {
    currentStep.value++;
  }
}

function nextStep(): void {
  if (currentStep.value === 1) {
    // Valida e avança através do componente Step1
    step1Ref.value?.validateAndNext();
    return;
  }
  
  if (currentStep.value < totalSteps && canGoNext.value) {
    currentStep.value++;
  }
}

function previousStep(): void {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function resetForm(): void {
  form.name = '';
  form.objective = '';
  currentStep.value = 1;
}

async function submitHandler(): Promise<void> {
  isLoading.value = true;

  try {
    // TODO: Implementar chamada ao serviço
    console.log('Criar agente:', form);

    resetForm();
    modalBase.value?.close();
    emit('agentCreated');
  } finally {
    isLoading.value = false;
  }
}

function open(): void {
  resetForm();
  modalBase.value?.open();
}

defineExpose({ open });
</script>

<template>
  <BaseModal ref="modalBase" title="Criar Novo Agente IA">
    <div class="space-y-6">
      <!-- Progress Indicator -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="flex items-center"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
              :class="
                step <= currentStep
                  ? 'bg-primary text-primary-content'
                  : 'bg-gray-200 text-gray-500'
              "
            >
              {{ step }}
            </div>
            <div
              v-if="step < totalSteps"
              class="w-12 h-1 mx-1 transition-all"
              :class="step < currentStep ? 'bg-primary' : 'bg-gray-200'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="min-h-[300px]">
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ stepTitle }}</h3>
        <p class="text-gray-600 mb-4">{{ stepDescription }}</p>

        <!-- Step 1: Agent Name -->
        <Step1AgentName
          v-if="currentStep === 1"
          ref="step1Ref"
          v-model="form.name"
          @next="handleStep1Next"
        />

        <!-- Step 2: Agent Objective -->
        <Step2AgentObjective
          v-else-if="currentStep === 2"
          v-model="form.objective"
          :agent-name="form.name"
        />
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between items-center pt-4 border-t">
        <button
          v-if="currentStep > 1"
          @click="previousStep"
          type="button"
          class="btn btn-ghost"
        >
          <IconBack class="mr-2" />
          Voltar
        </button>
        <div v-else></div>

        <div class="flex gap-3">
          <button
            v-if="currentStep < totalSteps"
            @click="nextStep"
            type="button"
            :disabled="!canGoNext"
            class="btn btn-primary"
          >
            Avançar
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            v-else
            @click="submitHandler"
            type="button"
            :disabled="!canGoNext || isLoading"
            class="btn btn-primary"
          >
            <IconLoading v-if="isLoading" class="mr-2 animate-spin" />
            Criar Agente
          </button>

          <button
            type="button"
            @click="modalBase?.close()"
            class="btn btn-ghost"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
