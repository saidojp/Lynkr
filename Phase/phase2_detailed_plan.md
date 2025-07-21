# Фаза 2: Коллекции и Управление - Детальный План

## 🎯 Цели Фазы 2 (2-3 недели)

- ✅ Создать систему коллекций с CRUD операциями
- ✅ Реализовать иерархию и вложенность коллекций
- ✅ Добавить drag & drop функционал
- ✅ Настроить кастомизацию коллекций (цвета, иконки)
- ✅ Создать удобную навигацию по коллекциям

## 📋 Детальный Чек-лист

### Неделя 3: CRUD для коллекций и иерархия

#### ✅ Шаг 1: Создание composables для коллекций
**Файл: `composables/useCollections.ts`**

```typescript
// Основные операции с коллекциями
- fetchCollections() - получение всех коллекций пользователя
- createCollection() - создание новой коллекции
- updateCollection() - обновление коллекции
- deleteCollection() - удаление коллекции
- getCollectionHierarchy() - получение древовидной структуры
```

#### ✅ Шаг 2: Pinia Store для управления состоянием
**Файл: `stores/collections.ts`**

```typescript
// Состояние коллекций
- collections: Collection[] - массив всех коллекций
- selectedCollection: Collection | null - выбранная коллекция
- collectionTree: CollectionTree[] - древовидная структура
- loading: boolean - состояние загрузки
```

#### ✅ Шаг 3: Компоненты для коллекций
**Файлы для создания:**
- `components/collections/CollectionList.vue` - список коллекций
- `components/collections/CollectionItem.vue` - элемент коллекции
- `components/collections/CollectionForm.vue` - форма создания/редактирования
- `components/collections/CollectionTree.vue` - древовидное отображение

#### ✅ Шаг 4: Модальные окна и формы
**Файлы для создания:**
- `components/collections/CreateCollectionModal.vue` - создание коллекции
- `components/collections/EditCollectionModal.vue` - редактирование
- `components/collections/DeleteCollectionModal.vue` - подтверждение удаления

### Неделя 4: Иерархия, кастомизация и drag & drop

#### ✅ Шаг 5: Система иерархии
**Функции для реализации:**
- Древовидная структура в сайдбаре
- Breadcrumbs навигация
- Вложенные коллекции (parent-child)
- Ограничение глубины вложенности (максимум 3 уровня)

#### ✅ Шаг 6: Кастомизация коллекций
**Возможности кастомизации:**
- Цветовая маркировка (8 предустановленных цветов)
- Иконки для коллекций (из lucide-vue-next)
- Переименование и описания
- Настройка видимости

#### ✅ Шаг 7: Drag & Drop функционал
**Библиотеки для использования:**
- `@vueuse/integrations` для drag & drop
- Или нативный HTML5 Drag API

**Функции drag & drop:**
- Перемещение коллекций между уровнями
- Изменение порядка коллекций
- Визуальные индикаторы при перетаскивании
- Анимации при перемещении

## 🛠 Технические Детали

### Типы данных

```typescript
// Расширенные типы для коллекций
export interface CollectionTree extends Collection {
  children: CollectionTree[]
  level: number
  isExpanded: boolean
}

export interface CollectionWithCounts extends Collection {
  linksCount: number
  childrenCount: number
}

// Типы для drag & drop
export interface DragData {
  type: 'collection'
  id: string
  parentId: string | null
  position: number
}
```

### API Endpoints (Supabase функции)

```sql
-- Функции для работы с коллекциями
CREATE OR REPLACE FUNCTION get_collections_tree(user_uuid UUID)
CREATE OR REPLACE FUNCTION update_collection_positions(positions JSONB)
CREATE OR REPLACE FUNCTION move_collection_to_parent(collection_id UUID, new_parent_id UUID)
```

### Компоненты архитектура

```
components/collections/
├── CollectionList.vue           # Основной список коллекций
├── CollectionItem.vue           # Элемент коллекции с drag & drop
├── CollectionTree.vue           # Древовидное отображение
├── CollectionForm.vue           # Форма создания/редактирования
├── CollectionIcon.vue           # Выбор иконки
├── CollectionColorPicker.vue    # Выбор цвета
├── modals/
│   ├── CreateCollectionModal.vue
│   ├── EditCollectionModal.vue
│   └── DeleteCollectionModal.vue
└── navigation/
    ├── CollectionBreadcrumbs.vue
    └── CollectionSidebar.vue
```

## 🎨 UI/UX Соображения

### Дизайн коллекций
- Минималистичный card-based дизайн
- Hover эффекты для интерактивности
- Индикаторы количества ссылок
- Иконки статуса (публичная/приватная)

### Цветовая палитра для коллекций
```typescript
export const COLLECTION_COLORS = {
  default: '#9aa0a6',
  blue: '#1a73e8',
  green: '#34a853',
  yellow: '#fbbc04',
  red: '#ea4335',
  purple: '#9c27b0',
  orange: '#ff9800',
  pink: '#e91e63'
}
```

### Анимации
- Smooth transitions при открытии/закрытии
- Fade in/out для модальных окон
- Плавные анимации drag & drop
- Micro-interactions при hover

## 🔧 Пошаговая Реализация

### День 1-2: Основы коллекций
1. Создать `useCollections.ts` composable
2. Настроить `collections.ts` store
3. Создать базовый `CollectionList.vue`
4. Реализовать CRUD операции

### День 3-4: Формы и модальные окна
1. Создать `CollectionForm.vue`
2. Реализовать модальные окна
3. Добавить валидацию форм
4. Настроить обработку ошибок

### День 5-7: Иерархия и навигация
1. Реализовать древовидную структуру
2. Создать breadcrumbs навигацию
3. Настроить вложенность коллекций
4. Добавить expand/collapse функционал

### День 8-10: Кастомизация
1. Добавить выбор цветов
2. Реализовать выбор иконок
3. Создать систему тем для коллекций
4. Настроить персонализацию

### День 11-14: Drag & Drop
1. Интегрировать drag & drop библиотеку
2. Реализовать перемещение коллекций
3. Добавить визуальные индикаторы
4. Настроить анимации и фидбек

## 📊 Критерии Завершения

### Функциональные требования
- ✅ Пользователь может создать коллекцию
- ✅ Пользователь может редактировать коллекцию
- ✅ Пользователь может удалить коллекцию
- ✅ Поддержка вложенных коллекций (до 3 уровней)
- ✅ Drag & drop для изменения порядка
- ✅ Кастомизация цветов и иконок
- ✅ Breadcrumbs навигация

### Технические требования
- ✅ TypeScript типизация
- ✅ Реактивность через Pinia
- ✅ Оптимизированные запросы к Supabase
- ✅ Обработка ошибок
- ✅ Валидация данных
- ✅ Респонсивный дизайн

### UX требования
- ✅ Интуитивный интерфейс
- ✅ Быстрая отзывчивость
- ✅ Плавные анимации
- ✅ Визуальный фидбек
- ✅ Accessibility support

## 🚀 Следующие шаги

После завершения Фазы 2:
1. Тестирование всех функций коллекций
2. Оптимизация производительности
3. Подготовка к Фазе 3 (Карточки и Ссылки)
4. Документирование API и компонентов

## 📝 Рекомендации

### Лучшие практики
- Используйте композиционный подход для переиспользования логики
- Разделяйте UI логику от бизнес-логики
- Кешируйте данные для оптимизации производительности
- Добавляйте loading states для лучшего UX

### Потенциальные проблемы
- Сложность drag & drop может потребовать дополнительного времени
- Производительность при большом количестве коллекций
- Синхронизация состояния между компонентами

### Советы по отладке
- Используйте Vue DevTools для отслеживания состояния
- Логируйте все операции с коллекциями
- Тестируйте edge cases (пустые коллекции, глубокая вложенность)
