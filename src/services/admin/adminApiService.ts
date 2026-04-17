import type {
  AdminCategoryPayload,
  AdminCheckAd,
  AdminSubcategoryPayload,
  AdminUserCreatePayload,
  AdminUserNestedAd,
  AdminUserUpdatePayload,
  LaravelPaginated,
} from '../../types/admin'
import { requestJson } from '../apiClient'
import {
  buildAdminQuery,
  mapAdminCheckAd,
  mapCategory,
  mapAdminNestedAd,
  mapPaginated,
  mapSubcategory,
  mapUser,
  unwrapRecord,
} from './adminApiMappers'

const buildSubcategoryFormData = (payload: AdminSubcategoryPayload) => {
  const fd = new FormData()
  fd.append('category_id', String(payload.category_id))
  fd.append('name', payload.name)
  fd.append('slug', payload.slug)
  if (payload.sort_order !== undefined && payload.sort_order !== null) {
    fd.append('sort_order', String(payload.sort_order))
  }
  fd.append('is_active', payload.is_active ? '1' : '0')
  if (payload.image_url !== null && payload.image_url !== '') {
    fd.append('image_url', payload.image_url)
  }
  return fd
}

export const adminApiService = {
  async listModerationAds(params?: {
    status?: 'pending' | 'active' | 'rejected' | 'sold' | 'deleted'
    per_page?: number
    page?: number
  }): Promise<LaravelPaginated<AdminCheckAd>> {
    const query = buildAdminQuery({
      status: params?.status ?? 'pending',
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/ads${query}`)
    return mapPaginated(raw, mapAdminCheckAd)
  },

  /** Single ad (`GET /admin/ads/:id`) — use when nested `user.ads` omits this row. */
  async getAd(id: number): Promise<AdminUserNestedAd> {
    const raw = await requestJson<unknown>(`/admin/ads/${id}`)
    return mapAdminNestedAd(unwrapRecord(raw))
  },

  async approveAd(adId: number) {
    await requestJson<unknown>(`/admin/ads/${adId}/approve`, { method: 'PATCH' })
  },

  async rejectAd(adId: number, payload: { reason: string }) {
    await requestJson<unknown>(`/admin/ads/${adId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async listCategories(params?: { is_active?: boolean; per_page?: number; page?: number }) {
    const query = buildAdminQuery({
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
    const query = buildAdminQuery({
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

  async createSubcategory(payload: AdminSubcategoryPayload, imageFile?: File | null) {
    if (imageFile) {
      const body = buildSubcategoryFormData(payload)
      body.append('image', imageFile)
      const raw = await requestJson<unknown>('/admin/subcategories', {
        method: 'POST',
        body,
      })
      return mapSubcategory(unwrapRecord(raw))
    }
    const raw = await requestJson<unknown>('/admin/subcategories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapSubcategory(unwrapRecord(raw))
  },

  async updateSubcategory(id: number, payload: AdminSubcategoryPayload, imageFile?: File | null) {
    if (imageFile) {
      const body = buildSubcategoryFormData(payload)
      body.append('image', imageFile)
      body.append('_method', 'PUT')
      const raw = await requestJson<unknown>(`/admin/subcategories/${id}`, {
        method: 'POST',
        body,
      })
      return mapSubcategory(unwrapRecord(raw))
    }
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
    const query = buildAdminQuery({
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
