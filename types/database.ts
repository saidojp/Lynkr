// types/database.ts
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  settings?: UserSettings
  created_at: string
  updated_at: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  defaultView: 'grid' | 'list'
  language: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description?: string
  color?: string
  icon?: string
  parent_id?: string
  position: number
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  user_id: string
  collection_id: string
  url: string
  title: string
  description?: string
  color?: string
  is_favorite: boolean
  position: number
  metadata?: LinkMetadata
  created_at: string
  updated_at: string
}

export interface LinkMetadata {
  title?: string
  description?: string
  image?: string
  favicon?: string
  site_name?: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
}

export interface LinkTag {
  link_id: string
  tag_id: string
}
