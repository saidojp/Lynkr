<template>
  <UiCard class="w-full max-w-md mx-auto">
    <UiCardHeader class="text-center">
      <UiCardTitle class="text-2xl">Create Account</UiCardTitle>
      <UiCardDescription>Sign up to start organizing your links</UiCardDescription>
    </UiCardHeader>

    <UiCardContent>
      <!-- Error Message -->
      <div
        v-if="error"
        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- First Name -->
        <div class="space-y-2">
          <label for="firstName" class="text-sm font-medium text-zinc-700"> First Name </label>
          <UiInput
            id="firstName"
            v-model="credentials.firstName"
            type="text"
            required
            placeholder="John"
            class="w-full"
          />
        </div>

        <!-- Last Name -->
        <div class="space-y-2">
          <label for="lastName" class="text-sm font-medium text-zinc-700"> Last Name </label>
          <UiInput
            id="lastName"
            v-model="credentials.lastName"
            type="text"
            required
            placeholder="Doe"
            class="w-full"
          />
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-zinc-700"> Email </label>
          <UiInput
            id="email"
            v-model="credentials.email"
            type="email"
            required
            placeholder="john@example.com"
            class="w-full"
          />
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-zinc-700"> Password </label>
          <UiInput
            id="password"
            v-model="credentials.password"
            type="password"
            required
            placeholder="Create a secure password"
            class="w-full"
          />
        </div>

        <!-- Submit Button -->
        <UiButton type="submit" :disabled="loading" class="w-full">
          {{ loading ? 'Registering...' : 'Register' }}
        </UiButton>
      </form>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import UiCard from '../ui/UiCard.vue'
import UiCardHeader from '../ui/UiCardHeader.vue'
import UiCardTitle from '../ui/UiCardTitle.vue'
import UiCardDescription from '../ui/UiCardDescription.vue'
import UiCardContent from '../ui/UiCardContent.vue'
import UiInput from '../ui/UiInput.vue'
import UiButton from '../ui/UiButton.vue'

// Props and emits
const emit = defineEmits(['success', 'error'])

// Supabase
const supabase = useSupabaseClient()

// Form data
const credentials = ref({
  firstName: '',
  lastName: '',
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
    const { data, error: authError } = await supabase.auth.signUp({
      email: credentials.value.email,
      password: credentials.value.password,
      options: {
        data: {
          first_name: credentials.value.firstName,
          last_name: credentials.value.lastName,
        },
      },
    })

    if (authError) {
      error.value = authError.message
      emit('error', authError.message)
    } else {
      emit('success', data.user)
      await navigateTo('/dashboard')
    }
  } catch (err: any) {
    error.value = err.message || 'Registration failed'
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}
</script>
