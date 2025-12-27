<template>
  <div class="flex items-center gap-3 w-full h-full max-w-xs">
    <button @click="togglePlayPause" class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" :class="isPlaying ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'">
      <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
      </svg>
    </button>

    <div class="relative w-full h-2 bg-gray-200 rounded-full">
      <div class="absolute top-0 left-0 h-full bg-blue-400 rounded-full" :style="{ width: progress + '%' }"></div>
      <div class="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow border border-gray-300" :style="{ left: progress + '%' }"></div>
    </div>

    <span class="text-xs text-gray-500 w-12 text-right">{{ formattedTime }}</span>

    <audio ref="audioElement" :src="src" @loadedmetadata="onLoadedMetadata" @timeupdate="onTimeUpdate" @ended="onEnded"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  src: string;
}>();

const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const duration = ref(0);
const currentTime = ref(0);

const togglePlayPause = () => {
  if (audioElement.value) {
    if (isPlaying.value) {
      audioElement.value.pause();
    } else {
      audioElement.value.play();
    }
    isPlaying.value = !isPlaying.value;
  }
};

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration;
  }
};

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
  }
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0; // Reset on end
};

const progress = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formattedTime = computed(() => {
  const time = duration.value > 0 ? duration.value : 0;
  return formatTime(time);
});
</script>
