<script setup>
import apiClient from '@/api/apiClient';
import {onBeforeUnmount, onMounted, reactive} from "vue";
import {useToast} from "vue-toastification";
import IconLoading from "@/components/Icons/IconLoading.vue";
import {useAuthStore} from "@/features/auth/useAuthStore.ts";
import {formatarData} from "../utils/dateFormatter.js";
import {io} from "socket.io-client";

const socket = io('http://localhost:3000', {
  autoConnect: true,
  transports: ['websocket']
});
const authStore = useAuthStore();
const toast = useToast();
const state = reactive({
  chats: [],
  isLoading: false,
  chatActive: null,
  messages: [],
  message: '',
  userJoined: false
});

async function loadChats() {
  state.isLoading = true;

  await apiClient.get('/chat')
      .then((response) => state.chats = response.data)
      .catch(() => toast.error("Erro ao carregar os contatos."));

  state.isLoading = false;
}

async function loadMessages(chatId) {
  state.isLoading = true;

  try {
    await apiClient.get(`/chat/${chatId}/messages`)
        .then((response) => {
          state.messages = response.data;
          state.chatActive = chatId;

          const selectedChat = state.chats.find(chat => chat.id === chatId);
          state.userJoined = selectedChat?.isJoined ?? false;
        })
        .catch(() => toast.error("Erro ao carregar as mensagens."));

    socket.emit('joinChat', chatId);
  } catch {
    toast.error("Erro ao carregar as mensagens.");
  } finally {
    state.isLoading = false;
  }
}

async function sendMessage() {
  if (state.message === '') {
    return;
  }

  socket.emit('sendMessage', {
    userId: authStore.user.id,
    chatId: state.chatActive,
    content: state.message,
  });

  state.message = '';
}

async function joinChat() {
  await apiClient.post(`/chat/${state.chatActive}/join`)
      .then(() => state.userJoined = true)
      .catch(() => toast.error("Erro ao entrar no chat."))
}

socket.on('newMessage', (message) => {
  if (state.chatActive === message.chatId) {
    state.messages.push(message);
  }
})

import {ref, nextTick, watch} from 'vue';

const messageContainer = ref(null);

watch(() => state.messages.length, async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
});


onBeforeUnmount(() => {
  if (state.chatActive) {
    socket.emit('leaveChat', state.chatActive);
  }
})

onMounted(async () => {
  await loadChats();
  socket.connect();
});
</script>
<template>
  <div v-if="state.isLoading">
    <IconLoading/>
  </div>

  <div v-else class="w-96 py-10 justify-center px-6 lg:w-full h-full lg:px-8">
    <div class="bg-gray-600 overflow-hidden animate-rainbow-glow sm:rounded-lg flex h-full"
         style="min-height: 600px;">
      <!--list chats-->
      <div class="w-3/12 bg-gray-900 bg-opacity-50 border-r border-gray-700 overflow-y-scroll text-white">
        <ul>
          <li
              v-for="chat in state.chats"
              :key="chat.id"
              @click="() => loadMessages(chat.id)"
              :class="(state.chatActive === chat.id) ? 'bg-gray-200 bg-opacity-50' : ''"
              class="p-4 text-base leading-6 border-b border-gray-700 transition duration-150 hover:bg-gray-700 hover:bg-opacity-50 hover:cursor-pointer"
          >
            <p class="flex items-center text-gray-200 hover:text-white">
              {{ chat.name }}
              <span class="ml-2 w-2 h-2 bg-custom-blue rounded-full"></span>
            </p>
          </li>
        </ul>
      </div>

      <!--box message-->
      <div v-if="state.chatActive"
           class="w-9/12 flex flex-col justify-between h-full bg-gray-800 bg-opacity-70 text-white"
      >
        <div ref="messageContainer" class="w-full p-6 flex flex-col overflow-y-auto h-full">
          <!-- message -->
          <div v-for="message in state.messages"
               :key="message.id"
               class="w-full mb-3 msg-scroll"
               :class="(message.userId === authStore.user.id) ? 'text-right' : 'text-left'"
          >
            <p v-if="message.userId !== authStore.user.id" class="text-sm text-gray-400 mb-1">
              {{ message.user?.username || 'username' }}
            </p>
            <p class="inline-block p-2 rounded-md"
               style="max-width: 75%;"
               :class="(message.userId === authStore.user.id) ? 'messageFromMe' : 'message'"
            >
              {{ message.content }}
            </p>
            <span class="block mt-1 text-xs text-gray-500">{{ formatarData(message.createdAt) }}</span>
          </div>

          <!-- âncora para scroll -->
          <div ref="scrollAnchor"></div>
        </div>

        <!-- send message -->
        <div v-if="state.userJoined" class="w-full bg-gray-200 bg-opacity-25 p-6 border-t border-gray-200">
          <form v-on:submit.prevent="sendMessage" class="flex rounded-md overflow-hidden">
            <input v-model="state.message" type="text"
                   class="flex-1 px-4 py-2 text-sm text-white bg-gray-700 bg-opacity-40 focus:outline-none focus:ring focus:ring-custom-blue rounded-l-md">
            <button class="bg-custom-blue hover:bg-blue-600 transition px-4 py-2 text-white rounded-r-md">Enviar
            </button>
          </form>
        </div>

        <!-- join chat -->
        <div v-else-if="!state.userJoined && state.chatActive"
             class="w-full bg-gray-700 bg-opacity-50 p-6 border-t border-gray-800 text-white space-x-4">
          <span class="text-lg">Modo espectador.
            <span @click="joinChat" class="cursor-pointer">Clique aqui para participar</span>
          </span>
        </div>

      </div>
      <div v-else class="w-9/12 relative">
        <div class="w-full h-full flex items-center justify-center">
          <p class="text-gray-400 text-lg">Selecione um chat para ver as mensagens.</p>
        </div>
        <div class="absolute inset-0 bg-contain bg-no-repeat bg-center opacity-10"
             style="background-image: url('/images/cs-1.png');">
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.messageFromMe {
  @apply bg-cyan-500 bg-opacity-20 text-right text-white;
}

.message {
  @apply bg-blue-500 bg-opacity-20 text-left text-white;
}

@keyframes rainbow-glow {
  0% {
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  }
  50% {
    box-shadow: 0 0 16px rgba(0, 153, 255, 0.8);
  }
  100% {
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  }
}

.animate-rainbow-glow {
  animation: rainbow-glow 3s linear infinite;
}
</style>
