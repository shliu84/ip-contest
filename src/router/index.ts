import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/auth/LoginPage.vue'
import RegisterPage from '../views/auth/RegisterPage.vue'
import VerifyEmailPage from '../views/auth/VerifyEmailPage.vue'
import ForgotPasswordPage from '../views/auth/ForgotPasswordPage.vue'
import ResetPasswordPage from '../views/auth/ResetPasswordPage.vue'
import AdminPage from '../views/admin/AdminPage.vue'
import AdminExportsPage from '../views/admin/AdminExportsPage.vue'
import AdminSubmissionDetailPage from '../views/admin/AdminSubmissionDetailPage.vue'
import AdminSubmissionsPage from '../views/admin/AdminSubmissionsPage.vue'
import AdminUsersPage from '../views/admin/AdminUsersPage.vue'
import DashboardPage from '../views/applicant/DashboardPage.vue'
import PaymentCancelPage from '../views/applicant/PaymentCancelPage.vue'
import PaymentPage from '../views/applicant/PaymentPage.vue'
import PaymentSuccessPage from '../views/applicant/PaymentSuccessPage.vue'
import SubmissionPage from '../views/applicant/SubmissionPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/register', component: RegisterPage },
    { path: '/login', component: LoginPage },
    { path: '/verify-email', component: VerifyEmailPage },
    { path: '/forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password', component: ResetPasswordPage },
    { path: '/dashboard', component: DashboardPage },
    { path: '/submissions/new', component: SubmissionPage },
    { path: '/submissions/:id', component: SubmissionPage },
    { path: '/submissions/:id/payment', component: PaymentPage },
    { path: '/payment/success', component: PaymentSuccessPage },
    { path: '/payment/cancel', component: PaymentCancelPage },
    { path: '/admin', component: AdminPage },
    { path: '/admin/submissions', component: AdminSubmissionsPage },
    { path: '/admin/submissions/:id', component: AdminSubmissionDetailPage },
    { path: '/admin/exports', component: AdminExportsPage },
    { path: '/admin/users', component: AdminUsersPage },
  ],
})

export default router
