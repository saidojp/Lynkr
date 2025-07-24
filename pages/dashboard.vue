<template>
  <div class="min-h-screen bg-zinc-50">
    <!-- Modern Header -->
    <div class="bg-white border-b border-zinc-200">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-zinc-900">Dashboard</h1>
            <p class="text-zinc-600 mt-1" v-if="user">
              Welcome back, {{ user.user_metadata?.first_name || 'User' }}
              {{ user.user_metadata?.last_name || '' }}
            </p>
          </div>
          <UiButton @click="handleLogout" variant="outline" size="sm"> Logout </UiButton>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Collections -->
        <NuxtLink to="/collections">
          <UiCard
            class="cursor-pointer hover:shadow-lg hover:border-zinc-300 transition-all duration-200 group h-full"
          >
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <div
                  class="w-14 h-14 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-200 transition-colors"
                >
                  <Folder class="w-7 h-7 text-zinc-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-semibold text-zinc-900 mb-1">Collections</h3>
                  <p class="text-zinc-600 text-sm leading-relaxed">
                    Manage and organize your link collections
                  </p>
                </div>
              </div>
            </div>
          </UiCard>
        </NuxtLink>

        <!-- Add Collection -->
        <UiCard
          @click="createCollection"
          class="cursor-pointer hover:shadow-lg hover:border-zinc-300 transition-all duration-200 group h-full"
        >
          <div class="p-6">
            <div class="flex items-start space-x-4">
              <div
                class="w-14 h-14 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-200 transition-colors"
              >
                <Plus class="w-7 h-7 text-zinc-600" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-semibold text-zinc-900 mb-1">New Collection</h3>
                <p class="text-zinc-600 text-sm leading-relaxed">
                  Create a new collection for your links
                </p>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Stats -->
        <UiCard class="h-full">
          <div class="p-6">
            <div class="flex items-start space-x-4">
              <div class="w-14 h-14 bg-zinc-100 rounded-xl flex items-center justify-center">
                <BarChart3 class="w-7 h-7 text-zinc-600" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-semibold text-zinc-900 mb-1">Statistics</h3>
                <p class="text-zinc-600 text-sm leading-relaxed">
                  {{ collectionsCount }} collections created
                </p>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Recent Collections -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-zinc-900">Recent Collections</h2>
          <NuxtLink to="/collections">
            <UiButton variant="outline" size="sm">View All</UiButton>
          </NuxtLink>
        </div>

        <div
          v-if="recentCollections.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <UiCard
            v-for="collection in recentCollections"
            :key="collection.id"
            class="hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div class="p-5">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  :style="{ backgroundColor: collection.color }"
                >
                  <Folder class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-zinc-900 truncate">{{ collection.name }}</h3>
                  <p v-if="collection.description" class="text-sm text-zinc-600 truncate mt-1">
                    {{ collection.description }}
                  </p>
                  <p v-else class="text-sm text-zinc-400 mt-1">No description</p>
                </div>
              </div>
            </div>
          </UiCard>
        </div>

        <UiCard v-else class="text-center py-16">
          <div class="max-w-sm mx-auto">
            <div
              class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Folder class="w-8 h-8 text-zinc-400" />
            </div>
            <h3 class="text-lg font-semibold text-zinc-900 mb-2">No collections yet</h3>
            <p class="text-zinc-600 mb-6">
              Create your first collection to get started organizing your links.
            </p>
            <UiButton @click="createCollection">Create Collection</UiButton>
          </div>
        </UiCard>
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
