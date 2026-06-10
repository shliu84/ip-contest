<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title auth-title">
        <span>Admin</span>
        <h2>Admin Dashboard</h2>
        <p>Manage contest operations.</p>
      </div>

      <nav class="form-actions" aria-label="Admin sections">
        <RouterLink class="btn btn-primary auth-submit" to="/admin/submissions">
          Submissions
        </RouterLink>
        <RouterLink class="btn btn-outline auth-submit" to="/admin/users">
          Users
        </RouterLink>
        <RouterLink class="btn btn-outline auth-submit" to="/admin/exports">
          Exports
        </RouterLink>
      </nav>
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
