<template>
  <div class="collection-node">
    <!-- Основная строка коллекции -->
    <div
      class="flex items-center p-2 cursor-pointer group relative rounded-md"
      :class="{
        'bg-zinc-900 text-white': isSelected,
        'ml-4': level > 0,
        'border-l-2 border-zinc-300': level > 0,
      }"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
      @click="$emit('select', collection.id)"
    >
      <!-- Кнопка разворота (если есть дети) -->
      <UiButton
        v-if="hasChildren"
        variant="ghost"
        size="icon"
        @click.stop="$emit('toggle-expand', collection.id)"
        class="flex-shrink-0 w-5 h-5 mr-2"
      >
        <ChevronRight
          class="w-3 h-3 transition-transform duration-150"
          :class="{ 'rotate-90': isExpanded }"
        />
      </UiButton>

      <!-- Отступ если нет детей -->
      <div v-else class="w-5 flex-shrink-0"></div>

      <!-- Название коллекции -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <!-- Название с подсветкой поиска -->
          <span
            class="font-medium text-sm truncate"
            :class="{ 'text-white': isSelected, 'text-zinc-900': !isSelected }"
            v-html="highlightSearch(collection.name)"
          ></span>

          <!-- Индикаторы -->
          <div class="flex items-center space-x-1">
            <span v-if="collection.is_public" class="text-xs" title="Public">🌐</span>
            <span v-if="collection.is_favorite" class="text-xs" title="Favorite">❤️</span>
          </div>
        </div>

        <!-- Описание (если есть и включен поиск) -->
        <p
          v-if="collection.description && searchQuery"
          class="text-xs mt-1 truncate"
          :class="{ 'text-zinc-300': isSelected, 'text-zinc-600': !isSelected }"
          v-html="highlightSearch(collection.description)"
        ></p>
      </div>

      <!-- Счетчик ссылок -->
      <div
        v-if="linksCount !== undefined"
        class="flex-shrink-0 text-xs px-2 py-1 rounded-md"
        :class="{
          'bg-white text-zinc-900': isSelected,
          'bg-zinc-100 text-zinc-600': !isSelected,
        }"
      >
        {{ linksCount }}
      </div>

      <!-- Меню действий (показывается при наведении) -->
      <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <CollectionNodeActions
          :collection="collection"
          :is-selected="isSelected"
          @edit="$emit('edit', collection)"
          @delete="$emit('delete', collection)"
          @create-subcollection="$emit('create-subcollection', collection.id)"
        />
      </div>
    </div>

    <!-- Дочерние коллекции -->
    <div v-if="hasChildren && isExpanded" class="children-container">
      <CollectionTreeNode
        v-for="child in collection.children"
        :key="child.id"
        :collection="child"
        :level="level + 1"
        :selected-id="selectedId"
        :expanded-ids="expandedIds"
        :search-query="searchQuery"
        @select="$emit('select', $event)"
        @toggle-expand="$emit('toggle-expand', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @create-subcollection="$emit('create-subcollection', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Collection, CollectionTree } from '../../../types'
import { ChevronRight } from 'lucide-vue-next'
import { COLLECTION_ICONS, type IconKey } from '../../../utils/icons'
import UiButton from '../../ui/UiButton.vue'
import CollectionNodeActions from './CollectionNodeActions.vue'

interface Props {
  collection: CollectionTree
  level: number
  selectedId?: string | null
  expandedIds: string[]
  searchQuery?: string
  linksCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: null,
  searchQuery: '',
  linksCount: undefined,
})

const emit = defineEmits<{
  select: [collectionId: string]
  'toggle-expand': [collectionId: string]
  edit: [collection: Collection]
  delete: [collection: Collection]
  'create-subcollection': [parentId: string]
}>()

// Компоненты иконок
const iconComponents = COLLECTION_ICONS

// Вычисляемые свойства
const isSelected = computed(() => props.selectedId === props.collection.id)
const hasChildren = computed(
  () => props.collection.children && props.collection.children.length > 0
)
const isExpanded = computed(() => props.expandedIds.includes(props.collection.id))

// Получить компонент иконки
const getIconComponent = (iconName?: string) => {
  return COLLECTION_ICONS[iconName as IconKey]?.component || COLLECTION_ICONS.folder.component
}

// Подсветка поискового запроса в тексте
const highlightSearch = (text: string): string => {
  if (!props.searchQuery || !text) return text

  const regex = new RegExp(`(${escapeRegExp(props.searchQuery)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-black px-1">$1</mark>')
}

// Экранирование специальных символов для регулярного выражения
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
/* Анимации разворота */
.children-container {
  animation: expandChildren 0.2s ease-out;
  overflow: hidden;
}

@keyframes expandChildren {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover эффекты */
.collection-node {
  transition: all 0.15s ease-in-out;
}

.group:hover {
  transform: translateX(2px);
}

/* Стилизация маркера поиска */
:deep(mark) {
  background-color: #fef08a;
  color: #000;
  padding: 0.125rem;
  border-radius: 0.25rem;
}

/* Стили для выбранного элемента */
.collection-node .bg-black {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Индентация для вложенных элементов */
.border-l-4 {
  position: relative;
}

.border-l-4::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
  opacity: 0.5;
}

/* Плавная анимация для кнопки разворота */
.transition-transform {
  transition: transform 0.15s ease-in-out;
}
</style>
