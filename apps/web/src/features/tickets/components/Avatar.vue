<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name: string;
  image?: string | null;
  classSize?: string | null;
}

const props = defineProps<Props>();

const initials = computed(() => {
  const name = (props.name || '').trim();

  if (!name) {
    return '??';
  }

  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // fallback: first two letters of the first word
  const first = parts[0];
  return (first.slice(0, 2)).toUpperCase();
});
</script>

<template>
  <div class="avatar" v-if="props.image">
    <div class="rounded-full" :class="classSize || 'w-12'">
      <img :src="props.image as string" :alt="props.name" />
    </div>
  </div>

  <div class="avatar avatar-placeholder" v-else>
    <div class="bg-neutral text-neutral-content rounded-full" :class="classSize || 'w-12'">
      <span class="text">{{ initials }}</span>
    </div>
  </div>
</template>
