import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useSupabase } from '../composables/useSupabase'
import type {
  Link,
  CreateLinkData,
  UpdateLinkData,
  LinkFilters,
  LinkSortOptions,
  LinkMetadata,
} from '../types/links'

export const useLinksStore = defineStore('links', () => {
  const { supabase } = useSupabase()

  // State
  const links = ref<Link[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<LinkFilters>({})
  const sortOptions = ref<LinkSortOptions>({
    field: 'created_at',
    direction: 'desc',
  })

  // Getters
  const filteredLinks = computed(() => {
    let result = [...links.value]

    // Apply filters
    if (filters.value.collection_id) {
      result = result.filter(link => link.collection_id === filters.value.collection_id)
    }

    if (filters.value.is_favorite !== undefined) {
      result = result.filter(link => link.is_favorite === filters.value.is_favorite)
    }

    if (filters.value.is_archived !== undefined) {
      result = result.filter(link => link.is_archived === filters.value.is_archived)
    }

    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      result = result.filter(
        link =>
          link.title.toLowerCase().includes(searchTerm) ||
          link.description?.toLowerCase().includes(searchTerm) ||
          link.url.toLowerCase().includes(searchTerm) ||
          link.metadata?.description?.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.value.tags && filters.value.tags.length > 0) {
      result = result.filter(link => link.tags?.some(tag => filters.value.tags!.includes(tag)))
    }

    // Apply sorting
    result.sort((a, b) => {
      const { field, direction } = sortOptions.value
      let aValue = a[field]
      let bValue = b[field]

      if (field === 'title') {
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return result
  })

  const favoriteLinks = computed(() =>
    links.value.filter(link => link.is_favorite && !link.is_archived)
  )

  const recentLinks = computed(() =>
    links.value
      .filter(link => !link.is_archived)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
  )

  // Actions
  const fetchLinks = async (collectionId?: string) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('links')
        .select('*')
        .eq('is_archived', false)
        .order('position', { ascending: true })

      if (collectionId) {
        query = query.eq('collection_id', collectionId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      links.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch links'
      console.error('Error fetching links:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchLinkMetadata = async (url: string): Promise<LinkMetadata | null> => {
    try {
      // Call our edge function to fetch metadata
      const { data, error } = await supabase.functions.invoke('get-link-metadata', {
        body: { url },
      })

      if (error) throw error

      return data as LinkMetadata
    } catch (err) {
      console.error('Error fetching metadata:', err)
      return null
    }
  }

  const createLink = async (linkData: CreateLinkData): Promise<Link | null> => {
    loading.value = true
    error.value = null

    try {
      // Fetch metadata for the URL
      const metadata = await fetchLinkMetadata(linkData.url)

      // Get next position
      const { data: positionData } = await supabase
        .from('links')
        .select('position')
        .eq('collection_id', linkData.collection_id || null)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = positionData?.[0]?.position ? positionData[0].position + 1 : 1

      const newLink = {
        ...linkData,
        title: linkData.title || metadata?.title || new URL(linkData.url).hostname,
        description: linkData.description || metadata?.description || '',
        metadata,
        position: nextPosition,
        is_favorite: linkData.is_favorite || false,
        is_archived: false,
        visit_count: 0,
        tags: linkData.tags || [],
      }

      const { data, error: createError } = await supabase
        .from('links')
        .insert([newLink])
        .select()
        .single()

      if (createError) throw createError

      const createdLink = data as Link
      links.value.push(createdLink)

      return createdLink
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create link'
      console.error('Error creating link:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateLink = async (linkData: UpdateLinkData): Promise<Link | null> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('links')
        .update(linkData)
        .eq('id', linkData.id)
        .select()
        .single()

      if (updateError) throw updateError

      const updatedLink = data as Link
      const index = links.value.findIndex(link => link.id === linkData.id)
      if (index !== -1) {
        links.value[index] = updatedLink
      }

      return updatedLink
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update link'
      console.error('Error updating link:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteLink = async (linkId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase.from('links').delete().eq('id', linkId)

      if (deleteError) throw deleteError

      links.value = links.value.filter(link => link.id !== linkId)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete link'
      console.error('Error deleting link:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const toggleFavorite = async (linkId: string): Promise<boolean> => {
    const link = links.value.find(l => l.id === linkId)
    if (!link) return false

    return (
      (await updateLink({
        id: linkId,
        is_favorite: !link.is_favorite,
      })) !== null
    )
  }

  const incrementVisitCount = async (linkId: string): Promise<void> => {
    const link = links.value.find(l => l.id === linkId)
    if (!link) return

    try {
      await supabase
        .from('links')
        .update({
          visit_count: link.visit_count + 1,
          last_visited_at: new Date().toISOString(),
        })
        .eq('id', linkId)

      // Update local state
      link.visit_count += 1
      link.last_visited_at = new Date().toISOString()
    } catch (err) {
      console.error('Error incrementing visit count:', err)
    }
  }

  const reorderLinks = async (linkIds: string[], collectionId?: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const updates = linkIds.map((id, index) => ({
        id,
        position: index + 1,
      }))

      const { error: updateError } = await supabase.from('links').upsert(updates)

      if (updateError) throw updateError

      // Update local state
      linkIds.forEach((id, index) => {
        const link = links.value.find(l => l.id === id)
        if (link) {
          link.position = index + 1
        }
      })

      // Re-sort links by position
      links.value.sort((a, b) => a.position - b.position)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reorder links'
      console.error('Error reordering links:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const moveToCollection = async (
    linkId: string,
    targetCollectionId?: string
  ): Promise<boolean> => {
    return (
      (await updateLink({
        id: linkId,
        collection_id: targetCollectionId,
      })) !== null
    )
  }

  const setFilters = (newFilters: Partial<LinkFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const setSorting = (newSortOptions: Partial<LinkSortOptions>) => {
    sortOptions.value = { ...sortOptions.value, ...newSortOptions }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const refreshMetadata = async (linkId: string): Promise<boolean> => {
    const link = links.value.find(l => l.id === linkId)
    if (!link) return false

    const metadata = await fetchLinkMetadata(link.url)
    if (!metadata) return false

    return (
      (await updateLink({
        id: linkId,
        metadata,
        title: metadata.title || link.title,
        description: metadata.description || link.description,
      })) !== null
    )
  }

  return {
    // State
    links,
    loading,
    error,
    filters,
    sortOptions,

    // Getters
    filteredLinks,
    favoriteLinks,
    recentLinks,

    // Actions
    fetchLinks,
    fetchLinkMetadata,
    createLink,
    updateLink,
    deleteLink,
    toggleFavorite,
    incrementVisitCount,
    reorderLinks,
    moveToCollection,
    setFilters,
    setSorting,
    clearFilters,
    refreshMetadata,
  }
})
