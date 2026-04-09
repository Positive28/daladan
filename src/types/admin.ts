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

export interface AdminUserListItem {
  id: number
  fname: string | null
  lname: string | null
  phone: string
  role: string
  region_id: number | null
  city_id: number | null
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
