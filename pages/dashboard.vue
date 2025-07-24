<template>
  <div class="min-h-screen bg-white">
    <!-- Header with user info -->
    <div class="border-b-2 border-gray-900 bg-orange-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-black uppercase">Dashboard</h1>
          <p class="font-mono text-sm text-gray-600" v-if="user">
            Welcome, {{ user.user_metadata?.first_name || 'User' }}
            {{ user.user_metadata?.last_name || '' }}
          </p>
        </div>
        <UiButton @click="handleLogout" variant="destructive"> Logout </UiButton>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Collections -->
        <NuxtLink to="/collections">
          <UiCard class="cursor-pointer hover:shadow-md transition-all duration-200 group">
            <UiCardContent class="p-6">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Folder class="w-6 h-6 text-zinc-700" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-zinc-900">Collections</h3>
                  <p class="text-sm text-zinc-600">Manage your collections</p>
                </div>
              </div>
            </UiCardContent>
          </UiCard>
        </NuxtLink>

        <!-- Add Collection -->
        <UiCard
          @click="createCollection"
          class="cursor-pointer hover:shadow-md transition-all duration-200 group"
        >
          <UiCardContent class="p-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
                <Plus class="w-6 h-6 text-zinc-700" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-zinc-900">New Collection</h3>
                <p class="text-sm text-zinc-600">Create a new collection</p>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <!-- Stats -->
        <UiCard>
          <UiCardContent class="p-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
                <BarChart3 class="w-6 h-6 text-zinc-700" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-zinc-900">Statistics</h3>
                <p class="text-sm text-zinc-600">{{ collectionsCount }} collections</p>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Recent Collections -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold text-zinc-900 mb-6">Recent Collections</h2>
        <div
          v-if="recentCollections.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <UiCard v-for="collection in recentCollections" :key="collection.id">
            <UiCardContent class="p-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  :style="{ backgroundColor: collection.color }"
                >
                  <Folder class="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-sm text-zinc-900">{{ collection.name }}</h3>
                  <p v-if="collection.description" class="text-xs text-zinc-600 truncate">
                    {{ collection.description }}
                  </p>
                </div>
              </div>
            </UiCardContent>
          </UiCard>
        </div>
        <div v-else class="text-center py-12">
          <p class="text-zinc-500">No collections yet. Create your first one!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../stores/collections'
import { Folder, Plus, BarChart3 } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
})

// Auth - using Supabase directly
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Handle logout
const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    await navigateTo('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Collections store
const collectionsStore = useCollectionsStore()
const { collections } = storeToRefs(collectionsStore)

// Computed
const collectionsCount = computed(() => collections.value.length)
const recentCollections = computed(() => {
  return [...collections.value]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)
})

// Methods
const createCollection = () => {
  navigateTo('/collections?create=true')
}

// Initialize data
onMounted(async () => {
  try {
    // TODO: Load collections from Supabase
    console.log('Dashboard mounted, user:', user.value)
  } catch (error) {
    console.error('Error loading collections:', error)
  }
})
</script>
