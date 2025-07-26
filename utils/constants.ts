// utils/constants.ts

// Названия цветов на русском
export const COLOR_NAMES = {
  '#9aa0a6': 'Серый',
  '#1a73e8': 'Синий',
  '#34a853': 'Зеленый',
  '#fbbc04': 'Желтый',
  '#ea4335': 'Красный',
  '#9c27b0': 'Фиолетовый',
  '#ff9800': 'Оранжевый',
  '#e91e63': 'Розовый',
}

// Названия иконок на русском
export const ICON_NAMES = {
  folder: 'Папка',
  'folder-open': 'Открытая папка',
  star: 'Звезда',
  heart: 'Сердце',
  bookmark: 'Закладка',
  tag: 'Тег',
  archive: 'Архив',
  globe: 'Глобус',
  lock: 'Замок',
  coffee: 'Кофе',
  briefcase: 'Портфель',
  home: 'Дом',
  user: 'Пользователь',
  settings: 'Настройки',
  book: 'Книга',
  music: 'Музыка',
  image: 'Изображение',
  video: 'Видео',
  code: 'Код',
  gamepad2: 'Игры',
  'shopping-cart': 'Покупки',
}

// Настройки сортировки
export const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Сначала новые' },
  { value: 'created_asc', label: 'Сначала старые' },
  { value: 'name_asc', label: 'По алфавиту (А-Я)' },
  { value: 'name_desc', label: 'По алфавиту (Я-А)' },
  { value: 'visits_desc', label: 'По популярности' },
]

// Типы представления
export const VIEW_OPTIONS = [
  { value: 'grid', label: 'Сетка', icon: 'grid' },
  { value: 'list', label: 'Список', icon: 'list' },
  { value: 'compact', label: 'Компакт', icon: 'compact' },
]

// Лимиты
export const LIMITS = {
  MAX_COLLECTION_NAME_LENGTH: 100,
  MAX_COLLECTION_DESCRIPTION_LENGTH: 500,
  MAX_NESTING_LEVEL: 3,
  MAX_COLLECTIONS_PER_USER: 100,
}
