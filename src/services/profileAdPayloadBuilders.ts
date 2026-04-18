import type { CreateProfileAdPayload, UpdateProfileAdPayload } from '../types/marketplace'
import { ApiError } from './apiClient'

/**
 * UI labels are Uzbek (Latin); API expects English tokens / snake_case (min 4 characters each).
 * Legacy keys (`kg`, `m2`, `m3`) kept so old payloads still resolve.
 */
const UI_TO_API_UNIT: Record<string, string> = {
  kilogramm: 'kilogram',
  gramm: 'gram',
  tonna: 'tonne',
  litr: 'liter',
  millilitr: 'milliliter',
  dona: 'piece',
  juft: 'pair',
  quti: 'crate',
  qop: 'sack',
  savat: 'basket',
  banka: 'bottle',
  "bog'lam": 'bundle',
  paqir: 'pack',
  metr: 'meter',
  santimetr: 'centimeter',
  'kvadrat metr': 'square_meter',
  'kub metr': 'cubic_meter',
  sotix: 'sotix',
  gektar: 'hectare',
  bosh: 'generic',
  "to'plam": 'set_pack',
  karobka: 'carton',
  paket: 'packet',
  kg: 'kilogram',
  m2: 'square_meter',
  m3: 'cubic_meter',
}

/** Uzbek display names for unit pickers (same order as previous `UNIT_OPTIONS`; used by `features/create-ad`). */
export const PROFILE_AD_UNIT_OPTIONS = [
  'kilogramm',
  'gramm',
  'tonna',
  'litr',
  'millilitr',
  'dona',
  'juft',
  'quti',
  'qop',
  'savat',
  'banka',
  "bog'lam",
  'paqir',
  'metr',
  'santimetr',
  'kvadrat metr',
  'kub metr',
  'sotix',
  'gektar',
  'bosh',
  "to'plam",
  'karobka',
  'paket',
] as const

export const mapUiUnitToApi = (raw: string) => {
  const t = raw.trim()
  if (!t) return t
  const lower = t.toLowerCase()
  return (
    UI_TO_API_UNIT[t] ??
    UI_TO_API_UNIT[lower] ??
    Object.entries(UI_TO_API_UNIT).find(([key]) => key.toLowerCase() === lower)?.[1] ??
    t
  )
}

/** Best-effort reverse for displaying API-stored units in Uzbek UI labels. */
export const mapApiUnitToUi = (apiRaw: string) => {
  const t = apiRaw.trim()
  if (!t) return ''
  if (UI_TO_API_UNIT[t] !== undefined) return t
  const lowerKey = Object.keys(UI_TO_API_UNIT).find((k) => k.toLowerCase() === t.toLowerCase())
  if (lowerKey) return lowerKey
  const byValue = Object.entries(UI_TO_API_UNIT).find(([, v]) => v.toLowerCase() === t.toLowerCase())
  return byValue ? byValue[0] : t
}

export const toBasePayload = (payload: CreateProfileAdPayload | UpdateProfileAdPayload) => {
  const next: Record<string, unknown> = {}
  const assign = (key: string, value: unknown) => {
    if (value === undefined || value === null) return
    if (typeof value === 'string' && !value.trim()) return
    next[key] = value
  }

  assign('category_id', payload.category_id)
  assign('subcategory_id', payload.subcategory_id)
  assign('region_id', payload.region_id)
  assign('city_id', payload.city_id)
  assign('district', payload.district)
  assign('title', payload.title)
  assign('description', payload.description)
  assign('price', payload.price)
  assign('quantity', payload.quantity)
  assign('quantity_description', payload.quantity_description)
  if (typeof payload.unit === 'string' && payload.unit.trim()) {
    assign('unit', mapUiUnitToApi(payload.unit))
  }
  assign('delivery_available', payload.delivery_available)
  assign('delivery_info', payload.delivery_info)
  if (Array.isArray(payload.media)) {
    next.media = payload.media
  }

  return next
}

export const canRetryWithJson = (error: unknown) =>
  error instanceof ApiError && [400, 415, 422].includes(error.status)

export const createMultipartBody = (payload: CreateProfileAdPayload | UpdateProfileAdPayload) => {
  const body = new FormData()

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return
    if (typeof value === 'string' && !value.trim()) return
    body.append(key, String(value))
  }

  const appendBool = (key: string, value: boolean | undefined) => {
    if (value === undefined) return
    body.append(key, value ? '1' : '0')
  }

  append('category_id', payload.category_id)
  append('subcategory_id', payload.subcategory_id)
  append('region_id', payload.region_id)
  append('city_id', payload.city_id)
  append('district', payload.district)
  append('title', payload.title)
  append('description', payload.description)
  append('price', payload.price)
  append('quantity', payload.quantity)
  append('quantity_description', payload.quantity_description)
  if (typeof payload.unit === 'string' && payload.unit.trim()) {
    append('unit', mapUiUnitToApi(payload.unit))
  }
  appendBool('delivery_available', payload.delivery_available)
  append('delivery_info', payload.delivery_info)

  ;(payload.media ?? []).forEach((url) => {
    body.append('media[]', url)
  })

  payload.files?.forEach((file) => {
    body.append('media[]', file)
  })

  return body
}
