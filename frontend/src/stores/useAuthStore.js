import {ref, computed} from "vue"
import apiClient from "@/services/apiClient";
import {defineStore} from "pinia";

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const isLoggedIn = computed(() => !!user.value);
    const getUser = async function () {
        await apiClient.get('/me').then((response) => {
            user.value = response.data.body;
        })
    }
    const login = async function (credentials) {
        await apiClient.post('/login', credentials)
        await getUser();
    }
    const register = async function (credentials) {
        await apiClient.post('/register', credentials);
    }
    const logout = async function () {
        await apiClient.post('/logout');
        user.value = null;
    }
    return {user, isLoggedIn, getUser, login, register, logout}
}, {persist: true});
