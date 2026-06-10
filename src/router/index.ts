import { createRouter, createWebHistory } from 'vue-router'
import type { RouteMeta } from 'vue-router'
import { useSession } from '../stores/session'
import type { UserRole } from '../types/api'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/auth/LoginPage.vue'
import RegisterPage from '../views/auth/RegisterPage.vue'
import VerifyEmailPage from '../views/auth/VerifyEmailPage.vue'
import ForgotPasswordPage from '../views/auth/ForgotPasswordPage.vue'
import ResetPasswordPage from '../views/auth/ResetPasswordPage.vue'
import AdminHomePage from '../views/admin/AdminHomePage.vue'
import AdminExportsPage from '../views/admin/AdminExportsPage.vue'
import AdminSubmissionDetailPage from '../views/admin/AdminSubmissionDetailPage.vue'
import AdminSubmissionsPage from '../views/admin/AdminSubmissionsPage.vue'
import AdminUsersPage from '../views/admin/AdminUsersPage.vue'
import DashboardPage from '../views/applicant/DashboardPage.vue'
import PaymentCancelPage from '../views/applicant/PaymentCancelPage.vue'
import PaymentPage from '../views/applicant/PaymentPage.vue'
import PaymentSuccessPage from '../views/applicant/PaymentSuccessPage.vue'
import SubmissionEditorPage from '../views/applicant/SubmissionEditorPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    guestOnly?: boolean
    requiresAuth?: boolean
    roles?: UserRole[]
    usesTranslations?: boolean
  }
}

const applicantMeta: RouteMeta = {
  requiresAuth: true,
  usesTranslations: true,
}

const adminMeta: RouteMeta = {
  requiresAuth: true,
  roles: ['committee', 'super_admin'],
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/register', name: 'register', component: RegisterPage, meta: { guestOnly: true, usesTranslations: true } },
    { path: '/login', name: 'login', component: LoginPage, meta: { guestOnly: true, usesTranslations: true } },
    { path: '/verify-email', name: 'verify-email', component: VerifyEmailPage, meta: { usesTranslations: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordPage, meta: { guestOnly: true, usesTranslations: true } },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordPage, meta: { usesTranslations: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage, meta: applicantMeta },
    { path: '/submissions/new', name: 'submission-new', component: SubmissionEditorPage, meta: applicantMeta },
    { path: '/submissions/:id', name: 'submission-edit', component: SubmissionEditorPage, meta: applicantMeta },
    { path: '/submissions/:id/payment', name: 'submission-payment', component: PaymentPage, meta: applicantMeta },
    { path: '/payment/success', name: 'payment-success', component: PaymentSuccessPage, meta: applicantMeta },
    { path: '/payment/cancel', name: 'payment-cancel', component: PaymentCancelPage, meta: applicantMeta },
    { path: '/admin', name: 'admin', component: AdminHomePage, meta: adminMeta },
    { path: '/admin/submissions', name: 'admin-submissions', component: AdminSubmissionsPage, meta: adminMeta },
    { path: '/admin/submissions/:id', name: 'admin-submission-detail', component: AdminSubmissionDetailPage, meta: adminMeta },
    { path: '/admin/exports', name: 'admin-exports', component: AdminExportsPage, meta: adminMeta },
    { path: '/admin/users', name: 'admin-users', component: AdminUsersPage, meta: adminMeta },
    { path: '/:pathMatch(.*)*', name: 'not-found', redirect: { name: 'home' } },
  ],
})

router.beforeEach(async (to) => {
  const session = useSession()

  if (!session.hasLoadedSession.value) {
    await session.loadSession()
  }

  const user = session.currentUser.value

  if (to.meta.requiresAuth && !user) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && user) {
    return { name: 'dashboard' }
  }

  if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
    return { name: 'dashboard' }
  }
})
