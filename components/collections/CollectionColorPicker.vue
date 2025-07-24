<template>
  <div class="space-y-3">
    <!-- Предварительный просмотр выбранного цвета -->
    <div class="flex items-center space-x-3">
      <div
        class="w-6 h-6 border border-zinc-300 rounded-md shadow-sm"
        :style="{ backgroundColor: currentColor }"
      ></div>
      <span class="text-sm font-medium text-zinc-900">{{ getColorName(currentColor) }}</span>
    </div>

    <!-- Палитра цветов -->
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="colorObj in COLLECTION_COLORS"
        :key="colorObj.name"
        type="button"
        @click="selectColor(colorObj.value)"
        class="w-10 h-10 border border-zinc-300 rounded-md transition-all duration-150 hover:scale-105 hover:shadow-lg relative group"
        :style="{ backgroundColor: colorObj.value }"
        :class="{
          'ring-2 ring-offset-2 ring-zinc-400': currentColor === colorObj.value,
        }"
        :title="colorObj.name"
      >
        <!-- Чекмарк для выбранного цвета -->
        <div
          v-if="currentColor === colorObj.value"
          class="absolute inset-0 flex items-center justify-center"
        >
          <svg
            class="w-4 h-4 text-white drop-shadow-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <!-- Tooltip для hover -->
        <div
          class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10"
        >
          {{ colorObj.name }}
        </div>
      </button>
    </div>

    <!-- Кастомный цвет -->
    <div class="border-t border-zinc-200 pt-3">
      <label class="block text-xs font-medium text-zinc-900 mb-2">Custom Color</label>
      <div class="flex items-center space-x-3">
        <input
          v-model="customColor"
          type="color"
          @input="selectColor(customColor)"
          class="w-10 h-10 border border-zinc-300 rounded-md cursor-pointer"
        />
        <input
          v-model="customColor"
          type="text"
          @input="selectColor(customColor)"
          placeholder="#71717a"
          class="flex-1 px-3 py-2 border border-zinc-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 text-xs uppercase placeholder:text-zinc-400"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { COLLECTION_COLORS } from '../../utils/icons'

interface Props {
  currentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentColor: '#71717a',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const customColor = ref(props.currentColor)

// Получить название цвета
const getColorName = (color: string): string => {
  const colorObj = COLLECTION_COLORS.find(c => c.value === color)
  return colorObj ? colorObj.name : 'Custom'
}

// Выбор цвета
const selectColor = (color: string) => {
  // Валидация hex цвета
  const hexRegex = /^#[0-9A-Fa-f]{6}$/
  if (hexRegex.test(color)) {
    customColor.value = color
    emit('update:modelValue', color)
  }
}

// Отслеживание изменений текущего цвета
watch(
  () => props.currentColor,
  newColor => {
    customColor.value = newColor
  }
)
</script>

<style scoped>
/* Стилизация input[type="color"] */
input[type='color'] {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  cursor: pointer;
}

input[type='color']::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type='color']::-webkit-color-swatch {
  border: none;
  border-radius: 0;
}

input[type='color']::-moz-color-swatch {
  border: none;
  border-radius: 0;
}
</style>
