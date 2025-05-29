import './assets/main.css';
import 'vue-toastification/dist/index.css';

import { createApp } from 'vue';
import App from './App.vue';
import {createPinia} from "pinia";
import router from "@/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import Toast, {POSITION} from "vue-toastification";

const pinia = createPinia();
const app = createApp(App);

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(Toast, { position: POSITION.BOTTOM_RIGHT })
app.mount('#app');
