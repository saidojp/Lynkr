<template>
  <div
    class="group flex items-center space-x-4 p-3 bg-white border border-zinc-200 rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer"
    :class="{ 'border-zinc-300 bg-zinc-50': isSelected }"
    @click="handleClick"
    @contextmenu.prevent="$emit('context-menu', $event)"
  >
    <!-- Фавикон и название -->
    <div class="flex items-center space-x-3 flex-1 min-w-0">
      <!-- Фавикон -->
      <div class="flex-shrink-0 w-5 h-5">
        <img
          v-if="link.metadata?.favicon"
          :src="link.metadata.favicon"
          :alt="domain"
          class="w-5 h-5 rounded-sm"
          @error="onFaviconError"
        />
        <div v-else class="w-5 h-5 bg-zinc-300 rounded-sm flex items-center justify-center">
          <svg class="w-3 h-3 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118C6.004 2.87 4.192 1 2 1v2c1.007 0 1.875.718 2.083 1.682C4.583 5.37 4.083 6.168 4.083 9zM10 2C8.346 2 7 3.346 7 5s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm5.917 7c.208-.964 1.076-1.682 2.083-1.682V5c-2.192 0-4.004 1.87-4.866 4.118.454 1.148.748 2.572.837 4.118h1.946c0-2.832-.5-3.63-1-4.236z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Информация о ссылке -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <h3 class="font-medium text-zinc-900 truncate text-sm">
            {{ link.title }}
          </h3>
          <span v-if="link.is_favorite" class="text-rose-500 text-sm">❤️</span>
        </div>
        <div class="flex items-center space-x-2 mt-1">
          <span class="text-xs text-zinc-500">{{ domain }}</span>
          <span
            v-if="viewSettings.show_visit_count && link.visit_count > 0"
            class="text-xs text-zinc-400"
          >
            • {{ link.visit_count }} visits
          </span>
          <span class="text-xs text-zinc-400">• {{ formatDate(link.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Описание -->
    <div
      v-if="(link.description || link.metadata?.description) && viewSettings.show_description"
      class="flex-1 min-w-0 hidden md:block"
    >
      <p class="text-sm text-zinc-600 truncate">
        {{ link.description || link.metadata?.description }}
      </p>
    </div>

    <!-- Теги -->
    <div
      v-if="link.tags && link.tags.length > 0 && viewSettings.show_tags"
      class="flex-shrink-0 hidden lg:block"
    >
      <div class="flex space-x-1">
        <span
          v-for="tag in link.tags.slice(0, 2)"
          :key="tag"
          class="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full"
        >
          {{ tag }}
        </span>
        <span
          v-if="link.tags.length > 2"
          class="px-2 py-1 bg-zinc-100 text-zinc-500 text-xs rounded-full"
        >
          +{{ link.tags.length - 2 }}
        </span>
      </div>
    </div>

    <!-- Действия -->
    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <!-- Избранное -->
      <button
        @click.stop="$emit('toggle-favorite')"
        class="p-1 hover:bg-zinc-100 rounded-sm transition-colors"
        :class="{ 'text-rose-500': link.is_favorite, 'text-zinc-400': !link.is_favorite }"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </button>

      <!-- Меню -->
      <button
        @click.stop="$emit('menu', $event)"
        class="p-1 hover:bg-zinc-100 rounded-sm transition-colors text-zinc-400"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
          />
        </svg>
      </button>
    </div>

    <!-- Цветная полоска -->
    <div
      v-if="link.color"
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
      :style="{ backgroundColor: link.color }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Link, LinkViewSettings } from '../../types/links'

interface Props {
  link: Link
  isSelected?: boolean
  viewSettings?: LinkViewSettings
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  viewSettings: () => ({
    view_type: 'list',
    show_description: true,
    show_metadata: true,
    show_tags: true,
    show_visit_count: true,
  }),
})

const emit = defineEmits<{
  click: [link: Link]
  'toggle-favorite': []
  menu: [event: MouseEvent]
  'context-menu': [event: MouseEvent]
}>()

const faviconError = ref(false)

const domain = computed(() => {
  try {
    return new URL(props.link.url).hostname
  } catch {
    return props.link.url
  }
})

const handleClick = () => {
  emit('click', props.link)
}

const onFaviconError = () => {
  faviconError.value = true
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}w ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}mo ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>
