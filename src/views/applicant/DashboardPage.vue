<template>
  <main class="auth-page container">
    <div class="auth-panel">
      <div class="sec-title auth-title">
        <span>{{ t('dashboardKicker') }}</span>
        <h2>{{ t('dashboardTitle') }}</h2>
        <p>{{ t('dashboardLead') }}</p>
      </div>

      <section class="dashboard-summary" :aria-label="t('dashboardWelcome')">
        <dl>
          <div>
            <dt>{{ t('dashboardEmailLabel') }}</dt>
            <dd>{{ currentUser?.email }}</dd>
          </div>
          <div>
            <dt>{{ t('dashboardRoleLabel') }}</dt>
            <dd>{{ roleLabel }}</dd>
          </div>
        </dl>
      </section>

      <p v-if="errorMessage" class="form-error" role="alert" aria-live="polite">
        {{ errorMessage }}
      </p>

      <div class="form-actions">
        <button class="btn btn-primary auth-submit" type="button" :disabled="isPending" @click="logout">
          {{ isPending ? t('dashboardLogoutPending') : t('dashboardLogout') }}
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import { useSession } from '../../stores/session'
import type { UserRole } from '../../types/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const router = useRouter()
const session = useSession()
const currentUser = session.currentUser
const errorMessage = ref('')
const isPending = ref(false)

const roleLabel = computed(() => {
  const keyByRole: Record<UserRole, TranslationKey> = {
    applicant: 'roleApplicant',
    committee: 'roleCommittee',
    judge: 'roleJudge',
    super_admin: 'roleSuperAdmin',
  }
  const role = currentUser.value?.role
  return role ? props.t(keyByRole[role]) : ''
})

async function logout() {
  errorMessage.value = ''
  isPending.value = true
  try {
    await session.logout()
    await router.push('/login')
  } catch {
    errorMessage.value = props.t('errorGeneric')
  } finally {
    isPending.value = false
  }
}
</script>
