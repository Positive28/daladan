import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminSubcategory,
  AdminSubcategoryPayload,
  AdminUserCreatePayload,
  AdminUserListItem,
  AdminUserUpdatePayload,
  LaravelPaginated,
} from '../types/admin'
import { requestJson } from './apiClient'
import {
  asArray,
  asRecord,
  extractCollection,
  getBoolean,
  getNumber,
  getString,
  isNonEmptyRecord,
  type UnknownRecord,
} from './apiMappers'

const getNullableNumber = (obj: UnknownRecord, ...keys: string[]): number | null => {
  for (const key of keys) {
    const value = obj[key]
    if (value === null || value === undefined) return null
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return null
}

const mapCategory = (item: UnknownRecord): AdminCategory => ({
  id: getNumber(item, 'id'),
  name: getString(item, 'name'),
  slug: getString(item, 'slug'),
  sort_order: getNullableNumber(item, 'sort_order'),
  is_active: getBoolean(item, 'is_active'),
  created_at: getString(item, 'created_at'),
  updated_at: getString(item, 'updated_at'),
})

const mapSubcategory = (item: UnknownRecord): AdminSubcategory => {
  const cat = asRecord(item.category)
  const category = isNonEmptyRecord(cat)
    ? {
        id: getNumber(cat, 'id'),
        name: getString(cat, 'name'),
        slug: getString(cat, 'slug'),
      }
    : undefined

  return {
    id: getNumber(item, 'id'),
    category_id: getNumber(item, 'category_id'),
    name: getString(item, 'name'),
    slug: getString(item, 'slug'),
    sort_order: getNullableNumber(item, 'sort_order'),
    is_active: getBoolean(item, 'is_active'),
    created_at: getString(item, 'created_at'),
    updated_at: getString(item, 'updated_at'),
    category,
  }
}

const mapUser = (item: UnknownRecord): AdminUserListItem => ({
  id: getNumber(item, 'id'),
  fname: (() => {
    const v = item.fname
    if (v === null || v === undefined) return null
    return typeof v === 'string' ? v : null
  })(),
  lname: (() => {
    const v = item.lname
    if (v === null || v === undefined) return null
    return typeof v === 'string' ? v : null
  })(),
  phone: getString(item, 'phone'),
  role: getString(item, 'role') || 'user',
  region_id: getNullableNumber(item, 'region_id'),
  city_id: getNullableNumber(item, 'city_id'),
})

const mapPaginated = <T>(raw: unknown, mapItem: (row: UnknownRecord) => T): LaravelPaginated<T> => {
  const root = asRecord(raw)
  const data = asRecord(root.data)
  const rows = asArray(data.data)
  const items = rows.length > 0 ? rows.map(mapItem) : extractCollection(data).map(mapItem)
  const currentPage = getNumber(data, 'current_page')
  const perPage = getNumber(data, 'per_page')
  const total = getNumber(data, 'total')
  const lastFromApi = getNumber(data, 'last_page')
  const lastPage =
    lastFromApi > 0 ? lastFromApi : Math.max(1, perPage > 0 ? Math.ceil(total / perPage) : 1)

  return {
    items,
    currentPage: currentPage || 1,
    perPage: perPage || 15,
    total,
    lastPage,
  }
}

const unwrapRecord = (raw: unknown): UnknownRecord => {
  const root = asRecord(raw)
  const inner = root.data
  if (inner && typeof inner === 'object') return asRecord(inner)
  return root
}

const buildQuery = (params: Record<string, string | number | boolean | undefined | null>) => {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    qs.set(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export const adminApiService = {
  async listCategories(params?: { is_active?: boolean; per_page?: number; page?: number }) {
    const query = buildQuery({
      is_active: params?.is_active,
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/categories${query}`)
    return mapPaginated(raw, mapCategory)
  },

  async getCategory(id: number) {
    const raw = await requestJson<unknown>(`/admin/categories/${id}`)
    return mapCategory(unwrapRecord(raw))
  },

  async createCategory(payload: AdminCategoryPayload) {
    const raw = await requestJson<unknown>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapCategory(unwrapRecord(raw))
  },

  async updateCategory(id: number, payload: AdminCategoryPayload) {
    const raw = await requestJson<unknown>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapCategory(unwrapRecord(raw))
  },

  async deleteCategory(id: number) {
    await requestJson<unknown>(`/admin/categories/${id}`, { method: 'DELETE' })
  },

  async listSubcategories(params?: {
    category_id?: number
    is_active?: boolean
    per_page?: number
    page?: number
  }) {
    const query = buildQuery({
      category_id: params?.category_id,
      is_active: params?.is_active,
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/subcategories${query}`)
    return mapPaginated(raw, mapSubcategory)
  },

  async getSubcategory(id: number) {
    const raw = await requestJson<unknown>(`/admin/subcategories/${id}`)
    return mapSubcategory(unwrapRecord(raw))
  },

  async createSubcategory(payload: AdminSubcategoryPayload) {
    const raw = await requestJson<unknown>('/admin/subcategories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapSubcategory(unwrapRecord(raw))
  },

  async updateSubcategory(id: number, payload: AdminSubcategoryPayload) {
    const raw = await requestJson<unknown>(`/admin/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapSubcategory(unwrapRecord(raw))
  },

  async deleteSubcategory(id: number) {
    await requestJson<unknown>(`/admin/subcategories/${id}`, { method: 'DELETE' })
  },

  async listUsers(params?: { per_page?: number; page?: number }) {
    const query = buildQuery({
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/users${query}`)
    return mapPaginated(raw, mapUser)
  },

  async getUser(id: number) {
    const raw = await requestJson<unknown>(`/admin/users/${id}`)
    return mapUser(unwrapRecord(raw))
  },

  async createUser(payload: AdminUserCreatePayload) {
    const raw = await requestJson<unknown>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapUser(unwrapRecord(raw))
  },

  async updateUser(id: number, payload: AdminUserUpdatePayload) {
    const raw = await requestJson<unknown>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapUser(unwrapRecord(raw))
  },

  async deleteUser(id: number) {
    await requestJson<unknown>(`/admin/users/${id}`, { method: 'DELETE' })
  },
}
