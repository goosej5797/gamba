<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
  auth.initialize()
</script>
