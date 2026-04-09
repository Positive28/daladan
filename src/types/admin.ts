export interface LaravelPaginated<T> {
  items: T[]
  currentPage: number
  perPage: number
  total: number
  lastPage: number
}

export interface AdminCategory {
  id: number
  name: string
  slug: string
  sort_order: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminCategoryPayload {
  name: string
  slug: string
  sort_order?: number | null
  is_active: boolean
}

export interface AdminSubcategoryNestedCategory {
  id: number
  name: string
  slug: string
}

export interface AdminSubcategory {
  id: number
  category_id: number
  name: string
  slug: string
  sort_order: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  category?: AdminSubcategoryNestedCategory
}

export interface AdminSubcategoryPayload {
  category_id: number
  name: string
  slug: string
  sort_order?: number | null
  is_active: boolean
}

export type AdminUserRole = 'user' | 'admin'

/** Category / subcategory snippet on nested admin ads. */
export interface AdminAdNamedRef {
  id: number
  name: string
}

/** `media_list` entry on admin user nested ads. */
export interface AdminAdMediaListItem {
  id: number
  url?: string
  type?: string
}

/**
 * Full `ads[]` item from `GET /admin/users/:id` (admin API), mapped in `mapAdminNestedAd`.
 */
export interface AdminUserNestedAd {
  id: number
  seller_id: number
  category_id: number
  subcategory_id: number
  region_id: number
  city_id: number
  title: string
  description: string
  district: string
  price: number | null
  quantity: string | null
  unit: string | null
  status: string
  is_top_sale: boolean
  is_boosted: boolean
  boost_expires_at: string | null
  views_count: number
  expires_at: string | null
  created_at: string
  updated_at: string
  media_list: AdminAdMediaListItem[]
  category?: AdminAdNamedRef
  subcategory?: AdminAdNamedRef
  /** Spatie / full media payload as returned by API. */
  media: readonly unknown[]
}

export interface AdminUserListItem {
  id: number
  fname: string | null
  lname: string | null
  phone: string
  role: string
  region_id: number | null
  city_id: number | null
  email?: string | null
  telegram?: string | null
  telegram_id?: number | null
  ads_count?: number
  /** From `GET /admin/users/:id` nested `ads` (full rows). */
  adsRaw?: AdminUserNestedAd[]
  avatar_url?: string | null
  email_verified_at?: string | null
  region?: { id: number; name_uz: string }
  city?: { id: number; name_uz: string }
  media?: readonly unknown[]
}

export interface AdminUserCreatePayload {
  phone: string
  password: string
  fname?: string
  lname?: string
  email?: string
  telegram?: string
  telegram_id?: number
  region_id?: number
  city_id?: number
  role?: AdminUserRole
}

export interface AdminUserUpdatePayload {
  fname?: string
  lname?: string
  phone?: string
  email?: string
  password?: string
  telegram?: string
  telegram_id?: number
  region_id?: number
  city_id?: number
  role?: AdminUserRole
}

export * from './adminApi'
