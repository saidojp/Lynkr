<template>
  <div class="bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <div class="p-6">
      <h2 class="text-2xl font-black mb-6 text-center">LOGIN</h2>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 font-bold">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="block text-sm font-black mb-2 uppercase"> Email </label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            required
            class="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:ring-0 font-mono"
            placeholder="john@example.com"
          />
        </div>

        <!-- Password -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-black mb-2 uppercase"> Password </label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            class="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:ring-0 font-mono"
            placeholder="password123"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 px-4 bg-blue-400 border-2 border-gray-900 font-black hover:bg-blue-500 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
        >
          {{ loading ? 'LOGGING IN...' : 'LOGIN' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props and emits
const emit = defineEmits(['success', 'error'])

// Supabase
const supabase = useSupabaseClient()

// Form data
const credentials = ref({
  email: '',
  password: '',
})

// State
const loading = ref(false)
const error = ref('')

// Form submission
const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.value.email,
      password: credentials.value.password,
    })

    if (authError) {
      error.value = authError.message
      emit('error', authError.message)
    } else {
      emit('success', data.user)
      await navigateTo('/dashboard')
    }
  } catch (err: any) {
    error.value = err.message || 'Login failed'
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}
</script>
