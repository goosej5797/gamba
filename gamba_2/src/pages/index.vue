<template>
  <v-container class="py-8" max-width="900">
    <v-row align="center" class="mb-6">
      <v-col>
        <div class="text-h5 font-weight-bold">Pick'em League</div>
        <div class="text-body-2 text-medium-emphasis">
          Welcome back, {{ auth.profile?.display_name ?? auth.user?.email }}
          <v-chip v-if="auth.isAdmin" class="ml-2" color="primary" density="compact" label>
            Admin
          </v-chip>
        </div>
      </v-col>
      <v-col cols="auto">
        <v-btn prepend-icon="mdi-logout" variant="text" @click="auth.signOut()">
          Sign out
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" variant="tonal">
          <v-card-text class="text-center py-12 text-medium-emphasis">
            <v-icon size="48" class="mb-3">mdi-basketball</v-icon>
            <div class="text-body-1">No open weeks yet. Check back soon.</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
</script>
