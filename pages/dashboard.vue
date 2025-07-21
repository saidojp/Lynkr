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
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-400 border-2 border-gray-900 font-black uppercase hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Logout
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Collections -->
        <NuxtLink
          to="/collections"
          class="p-6 bg-white border-2 border-gray-900 hover:bg-yellow-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group"
        >
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-blue-400 border-2 border-gray-900 flex items-center justify-center font-black text-xl"
            >
              📁
            </div>
            <div>
              <h3 class="text-lg font-black uppercase">Collections</h3>
              <p class="text-sm font-mono text-gray-600">Manage your collections</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Add Collection -->
        <button
          @click="createCollection"
          class="p-6 bg-white border-2 border-gray-900 hover:bg-green-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group"
        >
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-green-400 border-2 border-gray-900 flex items-center justify-center font-black text-xl"
            >
              ➕
            </div>
            <div>
              <h3 class="text-lg font-black uppercase">New Collection</h3>
              <p class="text-sm font-mono text-gray-600">Create a new collection</p>
            </div>
          </div>
        </button>

        <!-- Stats -->
        <div class="p-6 bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-purple-400 border-2 border-gray-900 flex items-center justify-center font-black text-xl"
            >
              📊
            </div>
            <div>
              <h3 class="text-lg font-black uppercase">Statistics</h3>
              <p class="text-sm font-mono text-gray-600">{{ collectionsCount }} collections</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Collections -->
      <div class="mb-12">
        <h2 class="text-2xl font-black uppercase mb-6">Recent Collections</h2>
        <div
          v-if="recentCollections.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="collection in recentCollections"
            :key="collection.id"
            class="p-4 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 border-2 border-gray-900 flex items-center justify-center text-sm font-black"
                :style="{ backgroundColor: collection.color }"
              >
                {{ collection.icon }}
              </div>
              <div>
                <h3 class="font-black text-sm uppercase">{{ collection.name }}</h3>
                <p v-if="collection.description" class="text-xs font-mono text-gray-600 truncate">
                  {{ collection.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <p class="font-mono text-gray-500">No collections yet. Create your first one!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../stores/collections'

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
