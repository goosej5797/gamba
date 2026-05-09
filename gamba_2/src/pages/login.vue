<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card elevation="2" rounded="lg">
          <v-card-text class="pa-8">
            <div class="text-center mb-6">
              <v-icon color="primary" size="52">mdi-trophy-outline</v-icon>
              <div class="text-h5 font-weight-bold mt-2">Pick'em League</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Enter your email to receive a sign-in link
              </div>
            </div>

            <template v-if="!sent">
              <v-text-field
                v-model="email"
                label="Email address"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                :disabled="loading"
                @keyup.enter="submit"
              />

              <v-alert
                v-if="error"
                class="mb-4"
                density="compact"
                type="error"
                variant="tonal"
              >
                {{ error }}
              </v-alert>

              <v-btn
                block
                color="primary"
                :disabled="!email"
                :loading="loading"
                size="large"
                @click="submit"
              >
                Send magic link
              </v-btn>
            </template>

            <template v-else>
              <v-alert icon="mdi-email-check-outline" type="success" variant="tonal">
                <div class="font-weight-medium">Check your inbox</div>
                <div class="text-body-2 mt-1">
                  We sent a sign-in link to <strong>{{ email }}</strong>
                </div>
              </v-alert>

              <v-btn block class="mt-4" variant="text" @click="reset">
                Use a different email
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()

  const email = ref('')
  const loading = ref(false)
  const sent = ref(false)
  const error = ref('')

  async function submit() {
    if (!email.value) return
    loading.value = true
    error.value = ''
    try {
      await auth.signIn(email.value)
      sent.value = true
    }
    catch (e: any) {
      error.value = e?.message ?? 'Something went wrong. Please try again.'
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    sent.value = false
    email.value = ''
    error.value = ''
  }
</script>
