import { readonly, ref } from 'vue'
import { apiFetch } from '../services/api'
import type { CurrentUser, MeResponse } from '../types/api'

const currentUser = ref<CurrentUser | null>(null)
const isLoadingSession = ref(false)

export function useSession() {
  async function loadSession() {
    isLoadingSession.value = true
    try {
      const data = await apiFetch<MeResponse>('/api/me')
      currentUser.value = data.user
    } finally {
      isLoadingSession.value = false
    }
  }

  return {
    currentUser: readonly(currentUser),
    isLoadingSession: readonly(isLoadingSession),
    loadSession,
  }
}
