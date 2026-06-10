import { readonly, ref } from 'vue'
import { apiFetch, login as loginRequest, logout as logoutRequest } from '../services/api'
import type { CurrentUser, MeResponse } from '../types/api'

const currentUser = ref<CurrentUser | null>(null)
const isLoadingSession = ref(false)
const hasLoadedSession = ref(false)
let activeSessionRequest = 0

export function useSession() {
  async function loadSession() {
    const requestId = activeSessionRequest + 1
    activeSessionRequest = requestId
    isLoadingSession.value = true
    let didLoadSession = false
    try {
      const data = await apiFetch<MeResponse>('/api/me')
      if (requestId === activeSessionRequest) {
        currentUser.value = data.user
        didLoadSession = true
      }
    } catch (error) {
      if (requestId === activeSessionRequest) {
        currentUser.value = null
      }
      throw error
    } finally {
      if (requestId === activeSessionRequest) {
        isLoadingSession.value = false
        if (didLoadSession) {
          hasLoadedSession.value = true
        }
      }
    }
  }

  async function login(email: string, password: string) {
    const data = await loginRequest({ email, password })
    currentUser.value = data.user
    hasLoadedSession.value = true
    return data.user
  }

  async function logout() {
    try {
      await logoutRequest()
    } finally {
      currentUser.value = null
      hasLoadedSession.value = true
    }
  }

  return {
    currentUser: readonly(currentUser),
    isLoadingSession: readonly(isLoadingSession),
    hasLoadedSession: readonly(hasLoadedSession),
    loadSession,
    login,
    logout,
  }
}
