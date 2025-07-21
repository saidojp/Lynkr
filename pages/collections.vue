<template>
  <div class="min-h-screen bg-orange-50">
    <!-- Header -->
    <div class="border-b-2 border-gray-900 bg-white">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-black uppercase">Collections</h1>
          <p class="font-mono text-sm text-gray-600">Organize your link collections</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-green-400 border-2 border-gray-900 font-black uppercase hover:bg-green-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            ➕ New Collection
          </button>
          <NuxtLink
            to="/dashboard"
            class="px-4 py-2 bg-gray-400 border-2 border-gray-900 font-black uppercase hover:bg-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            🏠 Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex gap-8">
        <!-- Sidebar -->
        <div class="w-80 flex-shrink-0">
          <CollectionSidebar
            :selected-collection-id="selectedCollectionId"
            @create-collection="showCreateModal = true"
            @create-subcollection="handleCreateSubcollection"
            @select-collection="handleSelectCollection"
            @edit-collection="handleEditCollection"
            @delete-collection="handleDeleteCollection"
          />
        </div>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Breadcrumbs -->
          <CollectionBreadcrumbs
            :current-collection-id="selectedCollectionId"
            @navigate="handleNavigate"
            @create-subcollection="handleCreateSubcollection"
          />

          <!-- Collections Grid -->
          <div v-if="loading" class="text-center py-12">
            <div class="text-4xl mb-4">⏳</div>
            <p class="font-mono text-gray-500">Loading collections...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <div class="text-4xl mb-4">❌</div>
            <p class="font-mono text-red-500 mb-4">{{ error }}</p>
            <button
              @click="refreshCollections"
              class="px-4 py-2 bg-blue-400 border-2 border-gray-900 font-black uppercase hover:bg-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Try Again
            </button>
          </div>

          <div v-else-if="currentCollections.length === 0" class="text-center py-12">
            <div class="text-6xl mb-6">📁</div>
            <h2 class="text-2xl font-black uppercase mb-4">No Collections Yet</h2>
            <p class="font-mono text-gray-600 mb-6">Create your first collection to get started!</p>
            <button
              @click="showCreateModal = true"
              class="px-6 py-3 bg-green-400 border-2 border-gray-900 font-black uppercase hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              ➕ Create Collection
            </button>
          </div>

          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="collection in currentCollections"
                :key="collection.id"
                @click="handleSelectCollection(collection.id)"
                class="p-6 bg-white border-2 border-gray-900 hover:bg-yellow-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer group"
              >
                <!-- Collection Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 border-2 border-gray-900 flex items-center justify-center font-black text-lg"
                      :style="{ backgroundColor: collection.color }"
                    >
                      {{ collection.icon }}
                    </div>
                    <div>
                      <h3 class="font-black text-lg uppercase">{{ collection.name }}</h3>
                      <p v-if="collection.description" class="text-sm font-mono text-gray-600">
                        {{ collection.description }}
                      </p>
                    </div>
                  </div>

                  <!-- Actions Menu -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click.stop="handleEditCollection(collection)"
                      class="p-1 hover:bg-gray-200 rounded"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                <!-- Collection Stats -->
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center space-x-4">
                    <span class="font-mono text-gray-500">
                      {{ collection.children_count || 0 }} subcollections
                    </span>
                    <span class="font-mono text-gray-500">
                      {{ collection.links_count || 0 }} links
                    </span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span v-if="collection.is_favorite" title="Favorite">⭐</span>
                    <span v-if="collection.is_public" title="Public">🌐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateCollectionModal
      :show="showCreateModal"
      :parent-id="createParentId"
      @close="showCreateModal = false"
      @success="handleCollectionCreated"
    />

    <EditCollectionModal
      v-if="editingCollection"
      :show="showEditModal"
      :collection="editingCollection"
      @close="showEditModal = false"
      @success="handleCollectionUpdated"
    />

    <DeleteCollectionModal
      v-if="deletingCollection"
      :show="showDeleteModal"
      :collection="deletingCollection"
      @close="showDeleteModal = false"
      @success="handleCollectionDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../stores/collections'
import { useCollections } from '../composables/useCollections'
import CollectionSidebar from '../components/collections/navigation/CollectionSidebar.vue'
import CollectionBreadcrumbs from '../components/collections/navigation/CollectionBreadcrumbs.vue'
import CreateCollectionModal from '../components/collections/modals/CreateCollectionModal.vue'
import EditCollectionModal from '../components/collections/modals/EditCollectionModal.vue'
import DeleteCollectionModal from '../components/collections/modals/DeleteCollectionModal.vue'
import type { Collection } from '../types'

useHead({
  title: 'Collections',
})

definePageMeta({
  middleware: ['auth'],
})

const collectionsStore = useCollectionsStore()
const { collections, loading, error } = storeToRefs(collectionsStore)
const { fetchCollections, createCollection, updateCollection, deleteCollection } = useCollections()

// State
const selectedCollectionId = ref<string | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const createParentId = ref<string | null>(null)
const editingCollection = ref<Collection | null>(null)
const deletingCollection = ref<Collection | null>(null)

// Computed
const currentCollections = computed(() => {
  return collections.value.filter(collection => collection.parent_id === selectedCollectionId.value)
})

// Methods
const handleSelectCollection = (collectionId: string) => {
  selectedCollectionId.value = collectionId
}

const handleNavigate = (collectionId: string | null) => {
  selectedCollectionId.value = collectionId
}

const handleCreateSubcollection = (parentId: string | null) => {
  createParentId.value = parentId
  showCreateModal.value = true
}

const handleEditCollection = (collection: Collection) => {
  editingCollection.value = collection
  showEditModal.value = true
}

const handleDeleteCollection = (collection: Collection) => {
  deletingCollection.value = collection
  showDeleteModal.value = true
}

const handleCollectionCreated = (collection: Collection) => {
  showCreateModal.value = false
  createParentId.value = null
  refreshCollections()
}

const handleCollectionUpdated = (collection: Collection) => {
  showEditModal.value = false
  editingCollection.value = null
  refreshCollections()
}

const handleCollectionDeleted = () => {
  showDeleteModal.value = false
  deletingCollection.value = null
  refreshCollections()
}

const refreshCollections = async () => {
  try {
    await fetchCollections()
  } catch (err) {
    console.error('Failed to refresh collections:', err)
  }
}

// Initialize
onMounted(async () => {
  if (collections.value.length === 0) {
    await refreshCollections()
  }
})
</script>
