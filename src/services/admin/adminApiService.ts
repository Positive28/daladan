import type {
  AdminCategoryPayload,
  AdminSubcategoryPayload,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
} from '../../types/admin'
import { requestJson } from '../apiClient'
import {
  buildAdminQuery,
  mapCategory,
  mapPaginated,
  mapSubcategory,
  mapUser,
  unwrapRecord,
} from './adminApiMappers'

export const adminApiService = {
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
