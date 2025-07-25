<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- URL поле -->
    <div>
      <label class="block text-sm font-medium text-zinc-900 mb-2">Link URL *</label>
      <UiInput
        v-model="form.url"
        type="url"
        required
        placeholder="https://example.com"
        :class="{ 'border-red-300 focus:border-red-500': errors.url }"
        @blur="handleUrlBlur"
      />
      <p v-if="errors.url" class="text-red-600 text-xs mt-1">
        {{ errors.url }}
      </p>
    </div>

    <!-- Метаданные (автозаполнение) -->
    <div v-if="isLoadingMetadata" class="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
      <div class="flex items-center space-x-2">
        <div
          class="w-4 h-4 border border-zinc-300 border-t-zinc-600 rounded-full animate-spin"
        ></div>
        <span class="text-sm text-zinc-600">Loading page information...</span>
      </div>
    </div>

    <!-- Предварительный просмотр метаданных -->
    <div
      v-if="metadata && !isLoadingMetadata"
      class="p-4 border border-zinc-200 rounded-lg bg-zinc-50"
    >
      <h3 class="text-sm font-semibold text-zinc-900 mb-3">Page Preview</h3>
      <div class="flex space-x-3">
        <img
          v-if="metadata.image"
          :src="metadata.image"
          :alt="metadata.title"
          class="w-16 h-16 object-cover rounded-md flex-shrink-0"
        />
        <div class="flex-1">
          <h4 class="font-medium text-sm text-zinc-900">{{ metadata.title }}</h4>
          <p class="text-xs text-zinc-600 mt-1 line-clamp-2">{{ metadata.description }}</p>
          <p class="text-xs text-zinc-500 mt-2">{{ metadata.domain }}</p>
        </div>
      </div>
    </div>

    <!-- Название ссылки -->
    <div>
      <label class="block text-sm font-medium text-zinc-900 mb-2">Title *</label>
      <UiInput
        v-model="form.title"
        type="text"
        required
        placeholder="Link title"
        :class="{ 'border-red-300 focus:border-red-500': errors.title }"
      />
      <p v-if="errors.title" class="text-red-600 text-xs mt-1">
        {{ errors.title }}
      </p>
    </div>

    <!-- Описание -->
    <div>
      <label class="block text-sm font-medium text-zinc-900 mb-2">Description (optional)</label>
      <UiTextarea v-model="form.description" rows="3" placeholder="Brief description of the link" />
    </div>

    <!-- Коллекция -->
    <div v-if="availableCollections.length > 0">
      <label class="block text-sm font-medium text-zinc-900 mb-2">Collection</label>
      <select
        v-model="form.collection_id"
        class="w-full px-3 py-2 border border-zinc-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 text-sm"
      >
        <option value="">No Collection</option>
        <option
          v-for="collection in availableCollections"
          :key="collection.id"
          :value="collection.id"
        >
          {{ collection.level_indicator }}{{ collection.name }}
        </option>
      </select>
    </div>

    <!-- Теги -->
    <div>
      <label class="block text-sm font-medium text-zinc-900 mb-2">Tags</label>
      <div class="space-y-2">
        <!-- Поле ввода тегов -->
        <UiInput
          v-model="tagInput"
          type="text"
          placeholder="Add tags (press Enter or comma to add)"
          @keydown.enter.prevent="addTag"
          @keydown.comma.prevent="addTag"
        />

        <!-- Список тегов -->
        <div v-if="form.tags && form.tags.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="(tag, index) in form.tags"
            :key="index"
            class="inline-flex items-center px-2 py-1 bg-zinc-100 text-zinc-800 text-xs rounded-full"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(index)"
              class="ml-1 w-3 h-3 flex items-center justify-center hover:bg-zinc-200 rounded-full"
            >
              <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Настройки -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">Settings</h3>

      <!-- Избранное -->
      <div class="flex items-start space-x-3">
        <input
          v-model="form.is_favorite"
          type="checkbox"
          id="is_favorite"
          class="mt-1 w-4 h-4 border border-zinc-300 rounded bg-white focus:ring-2 focus:ring-zinc-500 checked:bg-zinc-900 checked:border-zinc-900"
        />
        <label for="is_favorite" class="text-sm">
          <span class="font-medium text-zinc-900">Add to Favorites</span>
          <p class="text-xs text-zinc-600 mt-1">Mark this link as favorite for quick access</p>
        </label>
      </div>

      <!-- Цвет -->
      <div>
        <label class="block text-sm font-medium text-zinc-900 mb-2">Color Accent</label>
        <div class="flex space-x-2">
          <button
            v-for="color in LINK_COLORS"
            :key="color.value"
            type="button"
            @click="form.color = color.value"
            class="w-8 h-8 rounded-full border-2 transition-all"
            :class="{
              'border-zinc-900 scale-110': form.color === color.value,
              'border-zinc-300': form.color !== color.value,
            }"
            :style="{ backgroundColor: color.value }"
            :title="color.name"
          />
          <button
            type="button"
            @click="form.color = ''"
            class="w-8 h-8 rounded-full border-2 bg-white transition-all flex items-center justify-center"
            :class="{
              'border-zinc-900 scale-110': !form.color,
              'border-zinc-300': form.color,
            }"
            title="No color"
          >
            <svg
              class="w-4 h-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Предварительный просмотр карточки -->
    <UiCard>
      <h3 class="text-sm font-semibold text-zinc-900 mb-3">Link Preview</h3>
      <div class="border border-zinc-200 rounded-lg p-3 bg-white">
        <LinkCard
          :link="previewLink"
          :view-settings="{
            view_type: 'grid',
            show_description: true,
            show_metadata: true,
            show_tags: true,
            show_visit_count: false,
          }"
        />
      </div>
    </UiCard>

    <!-- Кнопки действий -->
    <div class="flex items-center justify-end space-x-3 pt-6">
      <UiButton type="button" variant="outline" @click="$emit('cancel')"> Cancel </UiButton>

      <UiButton type="submit" :disabled="!isFormValid || loading">
        <span v-if="loading">
          {{ isEdit ? 'Saving...' : 'Adding...' }}
        </span>
        <span v-else>
          {{ isEdit ? 'Save Changes' : 'Add Link' }}
        </span>
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../stores/collections'
import { useLinksStore } from '../../stores/links'
import LinkCard from './LinkCard.vue'
import UiButton from '../ui/UiButton.vue'
import UiInput from '../ui/UiInput.vue'
import UiTextarea from '../ui/UiTextarea.vue'
import UiCard from '../ui/UiCard.vue'
import type { Link, CreateLinkData, LinkMetadata } from '../../types/links'
import type { CollectionTree } from '../../types'

interface Props {
  link?: Link | null
  collectionId?: string | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  link: null,
  collectionId: null,
  isEdit: false,
})

const emit = defineEmits<{
  submit: [data: CreateLinkData | (CreateLinkData & { id: string })]
  cancel: []
}>()

const collectionsStore = useCollectionsStore()
const linksStore = useLinksStore()
const { collectionsTree } = storeToRefs(collectionsStore)

const loading = ref(false)
const isLoadingMetadata = ref(false)
const metadata = ref<LinkMetadata | null>(null)
const tagInput = ref('')

// Цвета для ссылок
const LINK_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
]

// Форма
const form = ref({
  url: '',
  title: '',
  description: '',
  collection_id: props.collectionId || '',
  color: '',
  is_favorite: false,
  tags: [] as string[],
})

// Ошибки валидации
const errors = ref({
  url: '',
  title: '',
})

// Вычисляемые свойства
const availableCollections = computed(() => {
  const flattenCollections = (
    collections: CollectionTree[],
    level = 0
  ): Array<CollectionTree & { level_indicator: string }> => {
    const result: Array<CollectionTree & { level_indicator: string }> = []

    collections.forEach(collection => {
      result.push({
        ...collection,
        level_indicator: '—'.repeat(level) + (level > 0 ? ' ' : ''),
      })

      if (collection.children) {
        result.push(...flattenCollections(collection.children, level + 1))
      }
    })

    return result
  }

  return flattenCollections(collectionsTree.value)
})

const isFormValid = computed(() => {
  return (
    form.value.url.trim().length > 0 &&
    form.value.title.trim().length > 0 &&
    !errors.value.url &&
    !errors.value.title
  )
})

const previewLink = computed(
  () =>
    ({
      id: 'preview',
      user_id: 'preview',
      collection_id: form.value.collection_id,
      url: form.value.url,
      title: form.value.title || 'Link Title',
      description: form.value.description,
      color: form.value.color,
      position: 1,
      is_favorite: form.value.is_favorite,
      is_archived: false,
      visit_count: 0,
      metadata: metadata.value,
      tags: form.value.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) as Link
)

// Валидация
const validateForm = () => {
  errors.value.url = ''
  errors.value.title = ''

  // Валидация URL
  if (!form.value.url.trim()) {
    errors.value.url = 'URL is required'
    return false
  }

  try {
    new URL(form.value.url)
  } catch {
    errors.value.url = 'Please enter a valid URL'
    return false
  }

  // Валидация заголовка
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
    return false
  }

  if (form.value.title.trim().length > 200) {
    errors.value.title = 'Title must be less than 200 characters'
    return false
  }

  return true
}

// Обработчики
const handleUrlBlur = async () => {
  if (!form.value.url || isLoadingMetadata.value || metadata.value) return

  try {
    new URL(form.value.url)
  } catch {
    return
  }

  isLoadingMetadata.value = true

  try {
    const fetchedMetadata = await linksStore.fetchLinkMetadata(form.value.url)
    if (fetchedMetadata) {
      metadata.value = fetchedMetadata

      // Автозаполнение полей, если они пустые
      if (!form.value.title && fetchedMetadata.title) {
        form.value.title = fetchedMetadata.title
      }

      if (!form.value.description && fetchedMetadata.description) {
        form.value.description = fetchedMetadata.description
      }
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
  } finally {
    isLoadingMetadata.value = false
  }
}

const addTag = () => {
  const tag = tagInput.value.trim().replace(',', '')
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const data = {
      ...form.value,
      url: form.value.url.trim(),
      title: form.value.title.trim(),
      description: form.value.description?.trim() || undefined,
      collection_id: form.value.collection_id || undefined,
      color: form.value.color || undefined,
      tags: form.value.tags.length > 0 ? form.value.tags : undefined,
    }

    if (props.isEdit && props.link) {
      emit('submit', { ...data, id: props.link.id })
    } else {
      emit('submit', data)
    }
  } finally {
    loading.value = false
  }
}

// Инициализация формы
const initializeForm = () => {
  if (props.link) {
    form.value = {
      url: props.link.url || '',
      title: props.link.title || '',
      description: props.link.description || '',
      collection_id: props.link.collection_id || '',
      color: props.link.color || '',
      is_favorite: props.link.is_favorite || false,
      tags: props.link.tags || [],
    }
    metadata.value = props.link.metadata || null
  }
}

// Отслеживание изменений полей для валидации
watch(
  () => form.value.url,
  () => {
    if (errors.value.url) {
      validateForm()
    }
    // Сброс метаданных при изменении URL
    if (metadata.value) {
      metadata.value = null
    }
  }
)

watch(
  () => form.value.title,
  () => {
    if (errors.value.title) {
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
  () => props.link,
  () => {
    initializeForm()
  },
  { deep: true }
)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
