<template>
  <nav class="flex items-center space-x-2 py-3" aria-label="Collection Navigation">
    <!-- Домашняя страница -->
    <UiButton
      variant="outline"
      size="sm"
      @click="$emit('navigate', null)"
      :class="{ 'bg-zinc-900 text-white border-zinc-900': !currentCollectionId }"
    >
      <span>Home</span>
    </UiButton>

    <!-- Разделитель -->
    <ChevronRight v-if="breadcrumbs.length > 0" class="w-4 h-4 text-zinc-500" />

    <!-- Хлебные крошки -->
    <template v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.id">
      <UiButton
        variant="outline"
        size="sm"
        @click="$emit('navigate', breadcrumb.id)"
        :class="{
          'bg-zinc-900 text-white border-zinc-900': currentCollectionId === breadcrumb.id,
        }"
        class="max-w-xs"
        :title="breadcrumb.name"
      >
        <span class="truncate">{{ breadcrumb.name }}</span>
      </UiButton>

      <!-- Разделитель между крошками -->
      <ChevronRight v-if="index < breadcrumbs.length - 1" class="w-4 h-4 text-zinc-500" />
    </template>

    <!-- Действия -->
    <div class="flex items-center space-x-2 ml-auto">
      <!-- Кнопка "Наверх" если не на главной -->
      <UiButton
        v-if="breadcrumbs.length > 0"
        variant="outline"
        size="icon-sm"
        @click="goUp"
        title="Go up one level"
      >
        <ArrowUp class="w-4 h-4" />
      </UiButton>

      <!-- Кнопка создания подколлекции -->
      <UiButton @click="$emit('create-subcollection', currentCollectionId)" size="sm">
        <Plus class="w-4 h-4 mr-2" />
        <span>Create</span>
      </UiButton>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../../stores/collections'
import UiButton from '../../ui/UiButton.vue'
import type { Collection } from '../../../types'
import { ChevronRight, ArrowUp, Plus } from 'lucide-vue-next'

interface Props {
  currentCollectionId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  currentCollectionId: null,
})

const emit = defineEmits<{
  navigate: [collectionId: string | null]
  'create-subcollection': [parentId: string | null]
}>()

const collectionsStore = useCollectionsStore()

// Хлебные крошки для текущей коллекции
const breadcrumbs = computed((): Collection[] => {
  if (!props.currentCollectionId) return []
  return collectionsStore.getCollectionBreadcrumbs(props.currentCollectionId)
})

// Получить компонент иконки
const getIconComponent = (iconName?: string) => {
  return COLLECTION_ICONS[iconName as IconKey]?.component || COLLECTION_ICONS.folder.component
}

// Подняться на уровень вверх
const goUp = () => {
  if (breadcrumbs.value.length === 0) return

  if (breadcrumbs.value.length === 1) {
    // Если мы на первом уровне, идем на главную
    emit('navigate', null)
  } else {
    // Иначе идем к родительской коллекции
    const parentBreadcrumb = breadcrumbs.value[breadcrumbs.value.length - 2]
    if (parentBreadcrumb) {
      emit('navigate', parentBreadcrumb.id)
    }
  }
}
</script>

<style scoped>
/* Анимация появления хлебных крошек */
nav {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover эффекты для кнопок */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>
