// types/database.ts

// Основные интерфейсы (как у вас уже есть)
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
  is_public: boolean
  is_favorite: boolean
  default_sort?: string
  default_view?: string
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

// Типы для Supabase
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

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      collections: {
        Row: Collection
        Insert: Omit<Collection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Collection, 'id' | 'created_at' | 'updated_at'>>
      }
      links: {
        Row: Link
        Insert: Omit<Link, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Link, 'id' | 'created_at' | 'updated_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'>
        Update: Partial<Omit<Tag, 'id' | 'created_at'>>
      }
      link_tags: {
        Row: LinkTag
        Insert: LinkTag
        Update: LinkTag
      }
    }
  }
}
