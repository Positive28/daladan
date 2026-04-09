/**
 * Wire-format types for Laravel admin API JSON (snake_case, envelopes, paginator).
 * Runtime parsing stays in `services/admin/adminApiMappers`; these types document the contract.
 */

export interface ApiSuccessEnvelope<TData> {
  success: boolean
  data: TData
  message?: string
}

/** Laravel pagination `links` entry (e.g. Previous / page numbers / Next). */
export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

/** Laravel `LengthAwarePaginator` JSON shape. */
export interface LaravelLengthAwarePaginator<TItem> {
  current_page: number
  data: TItem[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

/**
 * Laravel debug / internal dump wrapper. Client normalizes to `original` when present.
 * @see normalizeAdminEnvelope in services/admin/adminApiMappers
 */
export interface LaravelDebugDumpEnvelope<TInner> {
  headers: Record<string, unknown>
  original: TInner
  exception: unknown | null
}

export interface AdminCategoryApiRow {
  id: number
  name: string
  slug: string
  sort_order: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminSubcategoryNestedCategoryApi {
  id: number
  name: string
  slug: string
}

export interface AdminSubcategoryApiRow {
  id: number
  category_id: number
  name: string
  slug: string
  sort_order: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  category?: AdminSubcategoryNestedCategoryApi
}

export interface AdminUserRegionRef {
  id: number
  name_uz: string
}

export interface AdminUserCityRef {
  id: number
  name_uz: string
}

export interface AdminUserApiRow {
  id: number
  fname: string | null
  lname: string | null
  phone: string
  telegram: string | null
  telegram_id: number | null
  role: string
  email: string | null
  email_verified_at: string | null
  region_id: number | null
  city_id: number | null
  created_at: string
  updated_at: string
  ads_count: number
  avatar_url: string | null
  region?: AdminUserRegionRef
  city?: AdminUserCityRef
  media: unknown[]
}

export interface CityApiRow {
  id: number
  region_id: number
  name_uz: string
  slug: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RegionWithCitiesApi {
  id: number
  name_uz: string
  slug: string
  cities: CityApiRow[]
}

/** Standard list response for admin categories (HTTP body, not debug wrapper). */
export type AdminCategoriesListResponse = ApiSuccessEnvelope<LaravelLengthAwarePaginator<AdminCategoryApiRow>>

/** Standard list response for admin subcategories. */
export type AdminSubcategoriesListResponse = ApiSuccessEnvelope<LaravelLengthAwarePaginator<AdminSubcategoryApiRow>>

/** Standard list response for admin users. */
export type AdminUsersListResponse = ApiSuccessEnvelope<LaravelLengthAwarePaginator<AdminUserApiRow>>

/** Debug-shaped list (unwrap `original` before parsing). */
export type AdminCategoriesListDebugResponse = LaravelDebugDumpEnvelope<AdminCategoriesListResponse>

export type AdminSubcategoriesListDebugResponse = LaravelDebugDumpEnvelope<AdminSubcategoriesListResponse>

export type AdminUsersListDebugResponse = LaravelDebugDumpEnvelope<AdminUsersListResponse>
