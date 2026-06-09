import { createRouter, createWebHistory } from 'vue-router'
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

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/register', name: 'register', component: RegisterPage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/verify-email', name: 'verify-email', component: VerifyEmailPage },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordPage },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage },
    { path: '/submissions/new', name: 'submission-new', component: SubmissionEditorPage },
    { path: '/submissions/:id', name: 'submission-edit', component: SubmissionEditorPage },
    { path: '/submissions/:id/payment', name: 'submission-payment', component: PaymentPage },
    { path: '/payment/success', name: 'payment-success', component: PaymentSuccessPage },
    { path: '/payment/cancel', name: 'payment-cancel', component: PaymentCancelPage },
    { path: '/admin', name: 'admin', component: AdminHomePage },
    { path: '/admin/submissions', name: 'admin-submissions', component: AdminSubmissionsPage },
    { path: '/admin/submissions/:id', name: 'admin-submission-detail', component: AdminSubmissionDetailPage },
    { path: '/admin/exports', name: 'admin-exports', component: AdminExportsPage },
    { path: '/admin/users', name: 'admin-users', component: AdminUsersPage },
  ],
})
