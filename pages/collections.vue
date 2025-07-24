<template>
  <div class="min-h-screen bg-zinc-50">
    <!-- Header -->
    <div class="border-b border-zinc-200 bg-white">
      <div class="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-zinc-900">Collections</h1>
          <p class="text-zinc-600 mt-1">Organize your link collections</p>
        </div>
        <div class="flex space-x-3">
          <UiButton @click="showCreateModal = true" class="gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Collection
          </UiButton>
          <UiButton variant="outline" as-child>
            <NuxtLink to="/dashboard" class="gap-2"> Dashboard </NuxtLink>
          </UiButton>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
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

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-16">
            <div
              class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600"
              ></div>
            </div>
            <h3 class="text-lg font-semibold text-zinc-900 mb-2">Loading Collections</h3>
            <p class="text-zinc-600">Please wait while we fetch your collections...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-16">
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-zinc-900 mb-2">Something went wrong</h3>
            <p class="text-zinc-600 mb-6">{{ error }}</p>
            <UiButton variant="outline" @click="refreshCollections">Try Again</UiButton>
          </div>

          <!-- Empty State -->
          <div v-else-if="currentCollections.length === 0" class="text-center py-16">
            <div
              class="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center"
            >
              <svg
                class="w-10 h-10 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5h8" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-zinc-900 mb-2">No Collections Yet</h3>
            <p class="text-zinc-600 mb-8 max-w-sm mx-auto">
              Create your first collection to start organizing your links and bookmarks.
            </p>
            <UiButton @click="showCreateModal = true" size="lg" class="gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Your First Collection
            </UiButton>
          </div>

          <!-- Collections Grid -->
          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <UiCard
                v-for="collection in currentCollections"
                :key="collection.id"
                @click="handleSelectCollection(collection.id)"
                class="cursor-pointer hover:shadow-lg hover:border-zinc-300 transition-all duration-200 group"
              >
                <div class="p-6">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium flex-shrink-0"
                        :style="{ backgroundColor: collection.color }"
                      >
                        <Folder class="w-6 h-6" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <span class="truncate font-medium text-zinc-900">
                          {{ collection.name }}
                        </span>
                        <p
                          v-if="collection.description"
                          class="text-sm text-zinc-600 truncate mt-1"
                        >
                          {{ collection.description }}
                        </p>
                        <p v-else class="text-sm text-zinc-400 mt-1">No description</p>
                      </div>
                    </div>

                    <!-- Actions Menu -->
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <UiButton
                        variant="ghost"
                        size="sm"
                        @click.stop="handleEditCollection(collection)"
                        title="Edit collection"
                        class="w-8 h-8 p-0"
                      >
                        <Edit2 class="w-4 h-4" />
                      </UiButton>
                    </div>
                  </div>

                  <!-- Collection Stats -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 text-sm text-zinc-600">
                      <span>{{ collection.children_count || 0 }} subcollections</span>
                      <span>{{ collection.links_count || 0 }} links</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div
                        v-if="collection.is_favorite"
                        class="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center"
                        title="Favorite"
                      >
                        <svg
                          class="w-3 h-3 text-yellow-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                          />
                        </svg>
                      </div>
                      <div
                        v-if="collection.is_public"
                        class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"
                        title="Public"
                      >
                        <svg
                          class="w-3 h-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </UiCard>
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
import UiButton from '../components/ui/UiButton.vue'
import UiCard from '../components/ui/UiCard.vue'
import UiCardHeader from '../components/ui/UiCardHeader.vue'
import UiCardTitle from '../components/ui/UiCardTitle.vue'
import UiCardDescription from '../components/ui/UiCardDescription.vue'
import UiCardContent from '../components/ui/UiCardContent.vue'
import { Folder, Edit2 } from 'lucide-vue-next'
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
