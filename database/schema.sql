

-- Таблица пользователей (расширение auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Таблица коллекций
create table public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text,
  icon text,
  parent_id uuid references public.collections(id) on delete cascade,
  position integer not null default 0,
  is_public boolean default false,
  is_favorite boolean default false,
  default_sort text default 'created_desc',
  default_view text default 'grid',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Таблица ссылок
create table public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  collection_id uuid references public.collections(id) on delete cascade,
  url text not null,
  title text not null,
  description text,
  color text,
  is_favorite boolean default false,
  is_archived boolean default false,
  position integer not null default 0,
  visit_count integer default 0,
  last_visited_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Таблица тегов
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamptz default now(),
  
  unique(user_id, name)
);

-- Связующая таблица ссылок и тегов
create table public.link_tags (
  link_id uuid references public.links(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (link_id, tag_id)
);

-- Индексы для производительности
create index idx_collections_user_id on public.collections(user_id);
create index idx_collections_parent_id on public.collections(parent_id);
create index idx_links_user_id on public.links(user_id);
create index idx_links_collection_id on public.links(collection_id);
create index idx_tags_user_id on public.tags(user_id);

-- RLS политики
-- Пользователи могут видеть только свои данные
create policy "Users can view own data" on public.users
  for all using (auth.uid() = id);

create policy "Users can view own collections" on public.collections
  for all using (auth.uid() = user_id);

create policy "Users can view own links" on public.links
  for all using (auth.uid() = user_id);

create policy "Users can view own tags" on public.tags
  for all using (auth.uid() = user_id);

create policy "Users can view own link_tags" on public.link_tags
  for all using (auth.uid() = (select user_id from public.links where id = link_id));

-- Включаем RLS для всех таблиц
alter table public.users enable row level security;
alter table public.collections enable row level security;
alter table public.links enable row level security;
alter table public.tags enable row level security;
alter table public.link_tags enable row level security;