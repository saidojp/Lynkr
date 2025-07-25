import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useSupabase } from '../composables/useSupabase'

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
}

export const useTagsStore = defineStore('tags', () => {
  const { supabase } = useSupabase()

  // State
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedTags = computed(() => [...tags.value].sort((a, b) => a.name.localeCompare(b.name)))

  const getTagsByNames = computed(
    () => (names: string[]) => tags.value.filter(tag => names.includes(tag.name))
  )

  // Actions
  const fetchTags = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase.from('tags').select('*').order('name')

      if (fetchError) throw fetchError

      tags.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tags'
      console.error('Error fetching tags:', err)
    } finally {
      loading.value = false
    }
  }

  const createTag = async (name: string, color?: string): Promise<Tag | null> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('tags')
        .insert([{ name, color }])
        .select()
        .single()

      if (createError) throw createError

      const newTag = data as Tag
      tags.value.push(newTag)

      return newTag
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create tag'
      console.error('Error creating tag:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateTag = async (
    id: string,
    updates: Partial<Pick<Tag, 'name' | 'color'>>
  ): Promise<Tag | null> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const updatedTag = data as Tag
      const index = tags.value.findIndex(tag => tag.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }

      return updatedTag
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update tag'
      console.error('Error updating tag:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteTag = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase.from('tags').delete().eq('id', id)

      if (deleteError) throw deleteError

      tags.value = tags.value.filter(tag => tag.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete tag'
      console.error('Error deleting tag:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getOrCreateTag = async (name: string, color?: string): Promise<Tag | null> => {
    // Проверяем, существует ли тег
    const existingTag = tags.value.find(tag => tag.name.toLowerCase() === name.toLowerCase())
    if (existingTag) {
      return existingTag
    }

    // Создаем новый тег
    return await createTag(name, color)
  }

  return {
    // State
    tags,
    loading,
    error,

    // Getters
    sortedTags,
    getTagsByNames,

    // Actions
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getOrCreateTag,
  }
})
