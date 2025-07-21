<template>
  <div class="space-y-3">
    <!-- Предварительный просмотр выбранного цвета -->
    <div class="flex items-center space-x-3">
      <div
        class="w-6 h-6 border-2 border-black rounded-sm"
        :style="{ backgroundColor: currentColor }"
      ></div>
      <span class="text-sm font-medium uppercase">{{ getColorName(currentColor) }}</span>
    </div>

    <!-- Палитра цветов -->
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="(color, key) in COLLECTION_COLORS"
        :key="key"
        type="button"
        @click="selectColor(color)"
        class="w-10 h-10 border-2 border-black rounded-sm transition-all duration-150 hover:scale-105 hover:shadow-md relative group"
        :style="{ backgroundColor: color }"
        :class="{
          'ring-2 ring-offset-2 ring-black': currentColor === color,
        }"
        :title="getColorName(color)"
      >
        <!-- Чекмарк для выбранного цвета -->
        <div
          v-if="currentColor === color"
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
          class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10"
        >
          {{ getColorName(color) }}
        </div>
      </button>
    </div>

    <!-- Кастомный цвет -->
    <div class="border-t-2 border-black pt-3">
      <label class="block text-xs font-medium uppercase mb-2">Кастомный цвет</label>
      <div class="flex items-center space-x-3">
        <input
          v-model="customColor"
          type="color"
          @input="selectColor(customColor)"
          class="w-10 h-10 border-2 border-black rounded-sm cursor-pointer"
        />
        <input
          v-model="customColor"
          type="text"
          @input="selectColor(customColor)"
          placeholder="#9aa0a6"
          class="flex-1 p-2 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-xs uppercase"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { COLLECTION_COLORS, COLOR_NAMES } from '../../utils/constants'

interface Props {
  currentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentColor: '#9aa0a6',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const customColor = ref(props.currentColor)

// Получить название цвета
const getColorName = (color: string): string => {
  return COLOR_NAMES[color as keyof typeof COLOR_NAMES] || 'Кастомный'
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
