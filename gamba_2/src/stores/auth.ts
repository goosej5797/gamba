import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type UserRole = 'admin' | 'member'

interface UserProfile {
  display_name: string | null
  email: string
  role: UserRole
}

// Module-level promise so the router guard can await the first auth state resolution
let _resolveReady!: () => void
const _readyPromise = new Promise<void>(resolve => { _resolveReady = resolve })

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const ready = ref(false)

  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('display_name, email, role')
      .eq('id', userId)
      .single()
    profile.value = data ?? null
  }

  function initialize() {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        profile.value = null
      }

      if (!ready.value) {
        ready.value = true
        _resolveReady()
      }
    })
  }

  async function signIn(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  function waitUntilReady() {
    return _readyPromise
  }

  return { user, profile, isAdmin, ready, initialize, signIn, signOut, waitUntilReady }
})
