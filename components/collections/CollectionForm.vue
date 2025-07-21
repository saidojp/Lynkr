<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Название коллекции -->
    <div>
      <label class="block text-sm font-bold uppercase mb-2"> Название коллекции * </label>
      <input
        v-model="form.name"
        type="text"
        required
        placeholder="Введите название коллекции"
        class="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
        :class="{ 'border-red-500': errors.name }"
      />
      <p v-if="errors.name" class="text-red-500 text-xs mt-1">
        {{ errors.name }}
      </p>
    </div>

    <!-- Описание коллекции -->
    <div>
      <label class="block text-sm font-bold uppercase mb-2"> Описание (опционально) </label>
      <textarea
        v-model="form.description"
        rows="3"
        placeholder="Краткое описание коллекции"
        class="w-full p-3 border-2 border-black bg-white resize-none focus:outline-none focus:ring-2 focus:ring-black text-sm"
      ></textarea>
    </div>

    <!-- Родительская коллекция (для подколлекций) -->
    <div v-if="availableParents.length > 0">
      <label class="block text-sm font-bold uppercase mb-2"> Родительская коллекция </label>
      <select
        v-model="form.parent_id"
        class="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
      >
        <option value="">Корневой уровень</option>
        <option v-for="parent in availableParents" :key="parent.id" :value="parent.id">
          {{ parent.level_indicator }}{{ parent.name }}
        </option>
      </select>
    </div>

    <!-- Выбор иконки -->
    <div>
      <label class="block text-sm font-bold uppercase mb-2"> Иконка коллекции </label>
      <CollectionIconPicker v-model="form.icon" :current-icon="form.icon" />
    </div>

    <!-- Выбор цвета -->
    <div>
      <label class="block text-sm font-bold uppercase mb-2"> Цвет коллекции </label>
      <CollectionColorPicker v-model="form.color" :current-color="form.color" />
    </div>

    <!-- Настройки видимости -->
    <div class="space-y-4">
      <h3 class="text-sm font-bold uppercase">Настройки видимости</h3>

      <!-- Публичная коллекция -->
      <div class="flex items-center space-x-3">
        <input
          v-model="form.is_public"
          type="checkbox"
          id="is_public"
          class="w-4 h-4 border-2 border-black bg-white focus:ring-2 focus:ring-black checked:bg-black"
        />
        <label for="is_public" class="text-sm">
          <span class="font-medium">Публичная коллекция</span>
          <p class="text-xs text-gray-600 mt-1">
            Другие пользователи смогут видеть эту коллекцию и ее содержимое
          </p>
        </label>
      </div>

      <!-- Избранная коллекция -->
      <div class="flex items-center space-x-3">
        <input
          v-model="form.is_favorite"
          type="checkbox"
          id="is_favorite"
          class="w-4 h-4 border-2 border-black bg-white focus:ring-2 focus:ring-black checked:bg-black"
        />
        <label for="is_favorite" class="text-sm">
          <span class="font-medium">Избранная коллекция</span>
          <p class="text-xs text-gray-600 mt-1">Коллекция будет отображаться в разделе избранных</p>
        </label>
      </div>
    </div>

    <!-- Дополнительные настройки -->
    <div class="space-y-4">
      <h3 class="text-sm font-bold uppercase">Дополнительные настройки</h3>

      <!-- Сортировка ссылок -->
      <div>
        <label class="block text-sm font-medium mb-2"> Сортировка ссылок по умолчанию </label>
        <select
          v-model="form.default_sort"
          class="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
        >
          <option value="created_desc">Сначала новые</option>
          <option value="created_asc">Сначала старые</option>
          <option value="name_asc">По алфавиту (А-Я)</option>
          <option value="name_desc">По алфавиту (Я-А)</option>
          <option value="visits_desc">По популярности</option>
        </select>
      </div>

      <!-- Представление по умолчанию -->
      <div>
        <label class="block text-sm font-medium mb-2"> Представление по умолчанию </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            type="button"
            @click="form.default_view = 'grid'"
            class="p-3 border-2 border-black bg-white text-center transition-colors duration-150 hover:bg-gray-100"
            :class="{
              'bg-black text-white': form.default_view === 'grid',
              'hover:bg-black hover:text-white': form.default_view !== 'grid',
            }"
          >
            <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              ></path>
            </svg>
            <span class="text-xs">Сетка</span>
          </button>

          <button
            type="button"
            @click="form.default_view = 'list'"
            class="p-3 border-2 border-black bg-white text-center transition-colors duration-150 hover:bg-gray-100"
            :class="{
              'bg-black text-white': form.default_view === 'list',
              'hover:bg-black hover:text-white': form.default_view !== 'list',
            }"
          >
            <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              ></path>
            </svg>
            <span class="text-xs">Список</span>
          </button>

          <button
            type="button"
            @click="form.default_view = 'compact'"
            class="p-3 border-2 border-black bg-white text-center transition-colors duration-150 hover:bg-gray-100"
            :class="{
              'bg-black text-white': form.default_view === 'compact',
              'hover:bg-black hover:text-white': form.default_view !== 'compact',
            }"
          >
            <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
            <span class="text-xs">Компакт</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Предварительный просмотр -->
    <div class="border-2 border-black bg-gray-50 p-4">
      <h3 class="text-sm font-bold uppercase mb-3">Предварительный просмотр</h3>
      <div class="flex items-center space-x-3 p-3 bg-white border-2 border-black">
        <!-- Иконка -->
        <div
          class="w-8 h-8 border-2 border-black bg-white flex items-center justify-center"
          :style="{ borderLeftColor: form.color, borderLeftWidth: '4px' }"
        >
          <component :is="getIconComponent(form.icon)" class="w-4 h-4" />
        </div>

        <!-- Информация -->
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-sm uppercase">
              {{ form.name || 'Название коллекции' }}
            </span>
            <span v-if="form.is_public" class="text-xs text-green-600">🌐</span>
            <span v-if="form.is_favorite" class="text-xs text-red-500">❤️</span>
          </div>
          <p class="text-xs text-gray-600 mt-1">
            {{ form.description || 'Описание коллекции' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="flex items-center justify-end space-x-3 pt-6">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-6 py-3 border-2 border-black bg-white text-sm font-bold uppercase hover:bg-gray-100 transition-colors duration-150"
      >
        Отмена
      </button>

      <button
        type="submit"
        :disabled="!isFormValid || loading"
        class="px-6 py-3 border-2 border-black bg-black text-white text-sm font-bold uppercase hover:bg-gray-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">
          {{ isEdit ? 'Сохранение...' : 'Создание...' }}
        </span>
        <span v-else>
          {{ isEdit ? 'Сохранить изменения' : 'Создать коллекцию' }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../stores/collections'
import CollectionIconPicker from './CollectionIconPicker.vue'
import CollectionColorPicker from './CollectionColorPicker.vue'
import type { Collection, CollectionTree } from '../../types'
import {
  Folder,
  FolderOpen,
  Star,
  Heart,
  Bookmark,
  Tag,
  Archive,
  Globe,
  Lock,
  Coffee,
  Briefcase,
  Home,
  User,
  Settings,
  Book,
  Music,
  Image,
  Video,
  Code,
  Gamepad2,
  ShoppingCart,
} from 'lucide-vue-next'

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
  color: '#9aa0a6',
  is_public: false,
  is_favorite: false,
  default_sort: 'created_desc',
  default_view: 'grid',
})

// Ошибки валидации
const errors = ref({
  name: '',
})

// Иконки
const iconComponents = {
  folder: Folder,
  'folder-open': FolderOpen,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  tag: Tag,
  archive: Archive,
  globe: Globe,
  lock: Lock,
  coffee: Coffee,
  briefcase: Briefcase,
  home: Home,
  user: User,
  settings: Settings,
  book: Book,
  music: Music,
  image: Image,
  video: Video,
  code: Code,
  gamepad2: Gamepad2,
  'shopping-cart': ShoppingCart,
}

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

const getIconComponent = (iconName?: string) => {
  return iconComponents[iconName as keyof typeof iconComponents] || Folder
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
      color: props.collection.color || '#9aa0a6',
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
