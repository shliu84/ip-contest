import { readonly, ref } from 'vue'
import { apiFetch } from '../services/api'
import type { CurrentUser, MeResponse } from '../types/api'

const currentUser = ref<CurrentUser | null>(null)
const isLoadingSession = ref(false)
let activeSessionRequest = 0

export function useSession() {
  async function loadSession() {
    const requestId = activeSessionRequest + 1
    activeSessionRequest = requestId
    isLoadingSession.value = true
    try {
      const data = await apiFetch<MeResponse>('/api/me')
      if (requestId === activeSessionRequest) {
        currentUser.value = data.user
      }
    } catch (error) {
      if (requestId === activeSessionRequest) {
        currentUser.value = null
      }
      throw error
    } finally {
      if (requestId === activeSessionRequest) {
        isLoadingSession.value = false
      }
    }
  }

  return {
    currentUser: readonly(currentUser),
    isLoadingSession: readonly(isLoadingSession),
    loadSession,
  }
}
