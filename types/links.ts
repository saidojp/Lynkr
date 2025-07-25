export interface Link {
  id: string
  user_id: string
  collection_id?: string
  url: string
  title: string
  description?: string
  color?: string
  position: number
  is_favorite: boolean
  is_archived: boolean
  visit_count: number
  last_visited_at?: string
  metadata?: LinkMetadata
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface LinkMetadata {
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain?: string
  og_title?: string
  og_description?: string
  og_image?: string
  og_type?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  author?: string
  published_date?: string
  article_tag?: string[]
  video_duration?: number
  video_url?: string
}

export interface CreateLinkData {
  url: string
  title?: string
  description?: string
  collection_id?: string
  color?: string
  is_favorite?: boolean
  tags?: string[]
}

export interface UpdateLinkData extends Partial<CreateLinkData> {
  id: string
  metadata?: LinkMetadata
}

export interface LinkFilters {
  collection_id?: string
  is_favorite?: boolean
  is_archived?: boolean
  tags?: string[]
  search?: string
  date_from?: string
  date_to?: string
}

export interface LinkSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'visit_count' | 'last_visited_at'
  direction: 'asc' | 'desc'
}

export interface LinkViewSettings {
  view_type: 'grid' | 'list' | 'compact'
  cards_per_row?: number
  show_description?: boolean
  show_metadata?: boolean
  show_tags?: boolean
  show_visit_count?: boolean
}
