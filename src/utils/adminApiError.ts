import { ApiError } from '../services/apiClient'

export const getAdminErrorMessage = (e: unknown, fallback: string): string =>
  e instanceof Error ? e.message : fallback

export const isAdminForbidden = (e: unknown): boolean =>
  e instanceof ApiError && e.status === 403
