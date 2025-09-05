<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
}>();

const dialog = ref<HTMLDialogElement | null>(null);

function open(): void {
  dialog.value?.showModal();
}

function close(): void {
  dialog.value?.close();
}

defineExpose({ open, close });
</script>

<template>
  <dialog ref="dialog" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">

      <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="close">
        ✕
      </button>

      <h3 class="text-lg font-bold">{{ props.title }}</h3>

      <slot />
    </div>
  </dialog>
</template>
