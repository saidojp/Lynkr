<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Название коллекции -->
    <div>
      <label class="block text-sm font-medium text-zinc-900 mb-2">Collection Name *</label>
      <UiInput
        v-model="form.name"
        type="text"
        required
        placeholder="Enter collection name"
        :class="{ 'border-red-300 focus:border-red-500': errors.name }"
      />
      <p v-if="errors.name" class="text-red-600 text-xs mt-1">
        {{ errors.name }}
      </p>
    </div>

    <!-- Описание коллекции -->
    <div>
      <label class="block text-sm font-medium text-zinc-900 mb-2">Description (optional)</label>
      <UiTextarea
        v-model="form.description"
        rows="3"
        placeholder="Brief description of the collection"
      />
    </div>

    <!-- Родительская коллекция (для подколлекций) -->
    <div v-if="availableParents.length > 0">
      <label class="block text-sm font-medium text-zinc-900 mb-2">Parent Collection</label>
      <select
        v-model="form.parent_id"
        class="w-full px-3 py-2 border border-zinc-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 text-sm"
      >
        <option value="">Root Level</option>
        <option v-for="parent in availableParents" :key="parent.id" :value="parent.id">
          {{ parent.level_indicator }}{{ parent.name }}
        </option>
      </select>
    </div>

    <!-- Выбор иконки -->
    <div>
      <label class="block text-sm font-medium text-zinc-900 mb-2">Collection Icon</label>
      <CollectionIconPicker v-model="form.icon" :current-icon="form.icon" />
    </div>

    <!-- Настройки видимости -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">Visibility Settings</h3>

      <!-- Публичная коллекция -->
      <div class="flex items-start space-x-3">
        <input
          v-model="form.is_public"
          type="checkbox"
          id="is_public"
          class="mt-1 w-4 h-4 border border-zinc-300 rounded bg-white focus:ring-2 focus:ring-zinc-500 checked:bg-zinc-900 checked:border-zinc-900"
        />
        <label for="is_public" class="text-sm">
          <span class="font-medium text-zinc-900">Public Collection</span>
          <p class="text-xs text-zinc-600 mt-1">
            Other users will be able to see this collection and its contents
          </p>
        </label>
      </div>

      <!-- Избранная коллекция -->
      <div class="flex items-start space-x-3">
        <input
          v-model="form.is_favorite"
          type="checkbox"
          id="is_favorite"
          class="mt-1 w-4 h-4 border border-zinc-300 rounded bg-white focus:ring-2 focus:ring-zinc-500 checked:bg-zinc-900 checked:border-zinc-900"
        />
        <label for="is_favorite" class="text-sm">
          <span class="font-medium text-zinc-900">Favorite Collection</span>
          <p class="text-xs text-zinc-600 mt-1">
            Collection will be displayed in the favorites section
          </p>
        </label>
      </div>
    </div>

    <!-- Дополнительные настройки -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">Additional Settings</h3>

      <!-- Сортировка ссылок -->
      <div>
        <label class="block text-sm font-medium text-zinc-900 mb-2">Default Link Sorting</label>
        <select
          v-model="form.default_sort"
          class="w-full px-3 py-2 border border-zinc-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 text-sm"
        >
          <option value="created_desc">Newest First</option>
          <option value="created_asc">Oldest First</option>
          <option value="name_asc">Alphabetical (A-Z)</option>
          <option value="name_desc">Alphabetical (Z-A)</option>
          <option value="visits_desc">By Popularity</option>
        </select>
      </div>

      <!-- Представление по умолчанию -->
      <div>
        <label class="block text-sm font-medium text-zinc-900 mb-2">Default View</label>
        <div class="grid grid-cols-3 gap-3">
          <UiButton
            type="button"
            variant="outline"
            size="sm"
            @click="form.default_view = 'grid'"
            :class="{
              'bg-zinc-900 text-white border-zinc-900': form.default_view === 'grid',
            }"
            class="flex flex-col items-center p-3"
          >
            <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              ></path>
            </svg>
            <span class="text-xs">Grid</span>
          </UiButton>

          <UiButton
            type="button"
            variant="outline"
            size="sm"
            @click="form.default_view = 'list'"
            :class="{
              'bg-zinc-900 text-white border-zinc-900': form.default_view === 'list',
            }"
            class="flex flex-col items-center p-3"
          >
            <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              ></path>
            </svg>
            <span class="text-xs">List</span>
          </UiButton>

          <UiButton
            type="button"
            variant="outline"
            size="sm"
            @click="form.default_view = 'compact'"
            :class="{
              'bg-zinc-900 text-white border-zinc-900': form.default_view === 'compact',
            }"
            class="flex flex-col items-center p-3"
          >
            <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
            <span class="text-xs">Compact</span>
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Предварительный просмотр -->
    <UiCard>
      <h3 class="text-sm font-semibold text-zinc-900 mb-3">Preview</h3>
      <div class="flex items-center space-x-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
        <!-- Иконка -->
        <div
          class="w-8 h-8 border border-zinc-300 bg-white rounded-md flex items-center justify-center"
        >
          <component :is="getIconComponent(form.icon)" class="w-4 h-4 text-zinc-600" />
        </div>

        <!-- Информация -->
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span class="font-medium text-sm text-zinc-900">
              {{ form.name || 'Collection Name' }}
            </span>
            <span v-if="form.is_public" class="text-xs text-emerald-600">🌐</span>
            <span v-if="form.is_favorite" class="text-xs text-rose-500">❤️</span>
          </div>
          <p class="text-xs text-zinc-600 mt-1">
            {{ form.description || 'Collection description' }}
          </p>
        </div>
      </div>
    </UiCard>

    <!-- Кнопки действий -->
    <div class="flex items-center justify-end space-x-3 pt-6">
      <UiButton type="button" variant="outline" @click="$emit('cancel')"> Cancel </UiButton>

      <UiButton type="submit" :disabled="!isFormValid || loading">
        <span v-if="loading">
          {{ isEdit ? 'Saving...' : 'Creating...' }}
        </span>
        <span v-else>
          {{ isEdit ? 'Save Changes' : 'Create Collection' }}
        </span>
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../stores/collections'
import CollectionIconPicker from './CollectionIconPicker.vue'
import UiButton from '../ui/UiButton.vue'
import UiInput from '../ui/UiInput.vue'
import UiTextarea from '../ui/UiTextarea.vue'
import UiCard from '../ui/UiCard.vue'
import type { Collection, CollectionTree } from '../../types'
import { COLLECTION_ICONS, type IconKey } from '../../utils/icons'

interface Props {
  collection?: Collection | null
  parentId?: string | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collection: null,
  parentId: null,
  isEdit: false,
})

const emit = defineEmits<{
  submit: [data: Partial<Collection>]
  cancel: []
}>()

const collectionsStore = useCollectionsStore()
const { collectionsTree } = storeToRefs(collectionsStore)

const loading = ref(false)

// Форма
const form = ref({
  name: '',
  description: '',
  parent_id: props.parentId || '',
  icon: 'folder',
  is_public: false,
  is_favorite: false,
  default_sort: 'created_desc',
  default_view: 'grid',
})

// Ошибки валидации
const errors = ref({
  name: '',
})

// Вычисляемые свойства
const availableParents = computed(() => {
  const flattenCollections = (
    collections: CollectionTree[],
    level = 0
  ): Array<CollectionTree & { level_indicator: string }> => {
    const result: Array<CollectionTree & { level_indicator: string }> = []

    collections.forEach(collection => {
      // Исключаем текущую редактируемую коллекцию и ее потомков
      if (props.collection && collection.id === props.collection.id) {
        return
      }

      // Ограничиваем глубину вложенности (максимум 2 уровня)
      if (level < 2) {
        result.push({
          ...collection,
          level_indicator: '—'.repeat(level) + (level > 0 ? ' ' : ''),
        })

        if (collection.children) {
          result.push(...flattenCollections(collection.children, level + 1))
        }
      }
    })

    return result
  }

  return flattenCollections(collectionsTree.value)
})

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 && !errors.value.name
})

// Получить компонент иконки
const getIconComponent = (iconName?: string) => {
  return COLLECTION_ICONS[iconName as IconKey]?.component || COLLECTION_ICONS.folder.component
}

// Валидация
const validateForm = () => {
  errors.value.name = ''

  if (!form.value.name.trim()) {
    errors.value.name = 'Название коллекции обязательно'
    return false
  }

  if (form.value.name.trim().length > 100) {
    errors.value.name = 'Название не должно превышать 100 символов'
    return false
  }

  return true
}

// Обработчики
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const data = {
      ...form.value,
      name: form.value.name.trim(),
      description: form.value.description?.trim() || undefined,
      parent_id: form.value.parent_id || undefined,
    }

    emit('submit', data)
  } finally {
    loading.value = false
  }
}

// Инициализация формы
const initializeForm = () => {
  if (props.collection) {
    form.value = {
      name: props.collection.name || '',
      description: props.collection.description || '',
      parent_id: props.collection.parent_id || '',
      icon: props.collection.icon || 'folder',
      is_public: props.collection.is_public || false,
      is_favorite: props.collection.is_favorite || false,
      default_sort: props.collection.default_sort || 'created_desc',
      default_view: props.collection.default_view || 'grid',
    }
  }
}

// Отслеживание изменений названия для валидации
watch(
  () => form.value.name,
  () => {
    if (errors.value.name) {
      validateForm()
    }
  }
)

// Инициализация при монтировании
onMounted(() => {
  initializeForm()
})

// Обновление формы при изменении пропсов
watch(
  () => props.collection,
  () => {
    initializeForm()
  },
  { deep: true }
)
</script>
