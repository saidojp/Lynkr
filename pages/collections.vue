<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Хедер страницы -->
    <header class="bg-white border-b-2 border-black">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold uppercase">Коллекции</h1>
            <p class="text-sm text-gray-600 mt-1">Управление коллекциями ссылок</p>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Кнопка создания коллекции -->
            <button
              @click="showCreateModal = true"
              class="flex items-center space-x-2 px-4 py-2 bg-black text-white border-2 border-black font-medium uppercase hover:bg-gray-800 transition-colors"
            >
              <Plus class="w-4 h-4" />
              <span>Создать коллекцию</span>
            </button>

            <!-- Переключатель вида -->
            <div class="flex border-2 border-black bg-white">
              <button
                @click="viewMode = 'list'"
                class="px-3 py-2 text-sm font-medium uppercase transition-colors"
                :class="viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100'"
              >
                <List class="w-4 h-4" />
              </button>
              <button
                @click="viewMode = 'grid'"
                class="px-3 py-2 text-sm font-medium uppercase border-l-2 border-black transition-colors"
                :class="viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-100'"
              >
                <Grid class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto flex">
      <!-- Сайдбар с навигацией -->
      <CollectionSidebar
        :selected-collection-id="selectedCollectionId"
        @create-collection="showCreateModal = true"
        @create-subcollection="handleCreateSubcollection"
        @select-collection="handleSelectCollection"
        @edit-collection="handleEditCollection"
        @delete-collection="handleDeleteCollection"
        @retry="loadCollections"
      />

      <!-- Основное содержимое -->
      <main class="flex-1 p-6">
        <!-- Breadcrumbs навигация -->
        <CollectionBreadcrumbs
          :current-collection-id="selectedCollectionId"
          @navigate="handleNavigate"
          @create-subcollection="handleCreateSubcollection"
        />

        <!-- Содержимое коллекций -->
        <div class="mt-6">
          <!-- Загрузка -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-flex items-center space-x-2">
              <div
                class="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full"
              ></div>
              <span>Загрузка коллекций...</span>
            </div>
          </div>

          <!-- Ошибка -->
          <div v-else-if="error" class="text-center py-12">
            <div class="border-2 border-red-500 bg-red-50 p-6 max-w-md mx-auto">
              <AlertCircle class="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h3 class="text-lg font-bold text-red-800 mb-2">Произошла ошибка</h3>
              <p class="text-red-700 mb-4">{{ error }}</p>
              <button
                @click="loadCollections"
                class="px-4 py-2 bg-red-500 text-white border-2 border-red-500 font-medium uppercase hover:bg-red-600"
              >
                Попробовать снова
              </button>
            </div>
          </div>

          <!-- Список коллекций -->
          <div v-else-if="currentCollections.length > 0">
            <!-- Сетка коллекций -->
            <div
              v-if="viewMode === 'grid'"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <CollectionItem
                v-for="collection in currentCollections"
                :key="collection.id"
                :collection="collection"
                @select="handleSelectCollection"
                @edit="handleEditCollection"
                @delete="handleDeleteCollection"
              />
            </div>

            <!-- Список коллекций -->
            <div v-else class="space-y-2">
              <CollectionItem
                v-for="collection in currentCollections"
                :key="collection.id"
                :collection="collection"
                :is-list-mode="true"
                @select="handleSelectCollection"
                @edit="handleEditCollection"
                @delete="handleDeleteCollection"
              />
            </div>
          </div>

          <!-- Пустое состояние -->
          <div v-else class="text-center py-12">
            <Folder class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-bold text-gray-600 mb-2">
              {{
                selectedCollectionId
                  ? 'В коллекции пока нет подколлекций'
                  : 'У вас пока нет коллекций'
              }}
            </h3>
            <p class="text-gray-500 mb-6">
              {{
                selectedCollectionId
                  ? 'Создайте первую подколлекцию для организации ссылок'
                  : 'Создайте первую коллекцию для организации ваших ссылок'
              }}
            </p>
            <button
              @click="
                selectedCollectionId
                  ? handleCreateSubcollection(selectedCollectionId)
                  : (showCreateModal = true)
              "
              class="px-6 py-3 bg-black text-white border-2 border-black font-medium uppercase hover:bg-gray-800"
            >
              {{ selectedCollectionId ? 'Создать подколлекцию' : 'Создать коллекцию' }}
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Модальные окна -->
    <CreateCollectionModal
      :show="showCreateModal"
      :parent-id="createParentId"
      @close="
        showCreateModal = false
        createParentId = null
      "
      @success="handleCollectionCreated"
    />

    <EditCollectionModal
      :show="showEditModal"
      :collection="editingCollection"
      @close="
        showEditModal = false
        editingCollection = null
      "
      @success="handleCollectionUpdated"
    />

    <DeleteCollectionModal
      :show="showDeleteModal"
      :collection="deletingCollection"
      :links-count="0"
      :children-count="0"
      @close="
        showDeleteModal = false
        deletingCollection = null
      "
      @success="handleCollectionDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../stores/collections'
import type { Collection } from '../types'

// Компоненты
import CollectionSidebar from '../components/collections/navigation/CollectionSidebar.vue'
import CollectionBreadcrumbs from '../components/collections/navigation/CollectionBreadcrumbs.vue'
import CollectionItem from '../components/collections/CollectionItem.vue'
import CreateCollectionModal from '../components/collections/modals/CreateCollectionModal.vue'
import EditCollectionModal from '../components/collections/modals/EditCollectionModal.vue'
import DeleteCollectionModal from '../components/collections/modals/DeleteCollectionModal.vue'

// Иконки
import { Plus, List, Grid, Folder, AlertCircle } from 'lucide-vue-next'

// Store
const collectionsStore = useCollectionsStore()
const { collections, loading, error } = storeToRefs(collectionsStore)

// Локальное состояние
const selectedCollectionId = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const createParentId = ref<string | null>(null)
const editingCollection = ref<Collection | null>(null)
const deletingCollection = ref<Collection | null>(null)

// Текущие коллекции для отображения
const currentCollections = computed(() => {
  return collectionsStore.getChildCollections(selectedCollectionId.value)
})

// Обработчики событий
const loadCollections = async () => {
  try {
    await collectionsStore.initialize()
  } catch (error) {
    console.error('Error loading collections:', error)
  }
}

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
  // Коллекция уже добавлена в store через modal
  console.log('Collection created:', collection)
}

const handleCollectionUpdated = (collection: Collection) => {
  // Коллекция уже обновлена в store через modal
  console.log('Collection updated:', collection)
}

const handleCollectionDeleted = (collectionId: string) => {
  // Коллекция уже удалена из store через modal
  if (selectedCollectionId.value === collectionId) {
    selectedCollectionId.value = null
  }
  console.log('Collection deleted:', collectionId)
}

// Инициализация
onMounted(() => {
  loadCollections()
})
</script>

<style scoped>
/* Дополнительные стили для демонстрации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Анимации для кнопок */
button {
  transition: all 0.15s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>
