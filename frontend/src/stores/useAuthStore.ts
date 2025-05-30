import { ref, computed } from 'vue'
import apiClient from '@/services/apiClient'
import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
}

interface Credentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isLoggedIn = computed<boolean>(() => !!user.value)

  const getUser = async (): Promise<void> => {
    const response = await apiClient.get('/me')
    user.value = response.data.body as User
  }

  const login = async (credentials: Credentials): Promise<void> => {
    await apiClient.post('/login', credentials)
    await getUser()
  }

  const logout = async (): Promise<void> => {
    await apiClient.post('/logout')
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    getUser,
    login,
    logout,
  }
}, { persist: true })
