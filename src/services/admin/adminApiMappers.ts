import type {
  AdminCategory,
  AdminAdMediaListItem,
  AdminAdNamedRef,
  AdminSubcategory,
  AdminUserListItem,
  AdminUserNestedAd,
  LaravelPaginated,
} from '../../types/admin'
import {
  asArray,
  asRecord,
  extractCollection,
  getBoolean,
  getNumber,
  getString,
  isNonEmptyRecord,
  type UnknownRecord,
} from '../apiMappers'

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

export const mapCategory = (item: UnknownRecord): AdminCategory => ({
  id: getNumber(item, 'id'),
  name: getString(item, 'name'),
  slug: getString(item, 'slug'),
  sort_order: getNullableNumber(item, 'sort_order'),
  is_active: getBoolean(item, 'is_active'),
  created_at: getString(item, 'created_at'),
  updated_at: getString(item, 'updated_at'),
})

export const mapSubcategory = (item: UnknownRecord): AdminSubcategory => {
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

const nullableString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  return typeof value === 'string' ? value : null
}

const mapUserRegionRef = (value: unknown): { id: number; name_uz: string } | undefined => {
  const o = asRecord(value)
  if (!isNonEmptyRecord(o)) return undefined
  const id = getNumber(o, 'id')
  const name_uz = getString(o, 'name_uz', 'name_oz', 'name')
  if (!id || !name_uz) return undefined
  return { id, name_uz }
}

const nullableStringField = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  return typeof value === 'string' ? value : null
}

const nullableIsoString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  return typeof value === 'string' ? value : null
}

const mapAdminNamedRef = (value: unknown): AdminAdNamedRef | undefined => {
  const o = asRecord(value)
  if (!isNonEmptyRecord(o)) return undefined
  const id = getNumber(o, 'id')
  const name = getString(o, 'name', 'name_uz', 'name_oz', 'title')
  if (!id && !name) return undefined
  return { id, name: name || `ID ${id}` }
}

const mapAdminMediaList = (value: unknown): AdminAdMediaListItem[] => {
  if (!Array.isArray(value)) return []
  return value.map((raw) => {
    const o = asRecord(raw)
    return {
      id: getNumber(o, 'id'),
      url: getString(o, 'url', 'original_url') || undefined,
      type: typeof o.type === 'string' ? o.type : undefined,
    }
  })
}

export const mapAdminNestedAd = (row: UnknownRecord): AdminUserNestedAd => {
  const mediaRaw = row.media
  const media = Array.isArray(mediaRaw) ? [...mediaRaw] : []

  const qty = row.quantity
  const quantity =
    qty === null || qty === undefined
      ? null
      : typeof qty === 'string'
        ? qty
        : typeof qty === 'number' && !Number.isNaN(qty)
          ? String(qty)
          : null

  const unitVal = row.unit
  const unit =
    unitVal === null || unitVal === undefined
      ? null
      : typeof unitVal === 'string'
        ? unitVal
        : String(unitVal)

  return {
    id: getNumber(row, 'id'),
    seller_id: getNumber(row, 'seller_id'),
    category_id: getNumber(row, 'category_id'),
    subcategory_id: getNumber(row, 'subcategory_id'),
    region_id: getNumber(row, 'region_id'),
    city_id: getNumber(row, 'city_id'),
    title: getString(row, 'title', 'name') || '—',
    description: getString(row, 'description', 'desc') || '',
    district: getString(row, 'district') || '',
    price: getNullableNumber(row, 'price', 'amount'),
    quantity,
    unit,
    status: getString(row, 'status') || '',
    is_top_sale: getBoolean(row, 'is_top_sale', 'top_sale', 'is_top'),
    is_boosted: getBoolean(row, 'is_boosted', 'boosted'),
    boost_expires_at: nullableIsoString(row.boost_expires_at),
    views_count: getNumber(row, 'views_count'),
    expires_at: nullableIsoString(row.expires_at),
    created_at: getString(row, 'created_at'),
    updated_at: getString(row, 'updated_at'),
    media_list: mapAdminMediaList(row.media_list),
    category: mapAdminNamedRef(row.category),
    subcategory: mapAdminNamedRef(row.subcategory),
    media,
  }
}

export const mapUser = (item: UnknownRecord): AdminUserListItem => {
  const adsCountRaw = item.ads_count
  const ads_count =
    typeof adsCountRaw === 'number' && !Number.isNaN(adsCountRaw) ? adsCountRaw : undefined

  const mediaRaw = item.media
  const media = Array.isArray(mediaRaw) ? (mediaRaw as readonly unknown[]) : undefined

  const adsNested = item.ads
  const adsRaw = Array.isArray(adsNested)
    ? adsNested.map((row) => mapAdminNestedAd(asRecord(row)))
    : undefined

  return {
    id: getNumber(item, 'id'),
    fname: nullableStringField(item.fname),
    lname: nullableStringField(item.lname),
    phone: getString(item, 'phone'),
    role: getString(item, 'role') || 'user',
    region_id: getNullableNumber(item, 'region_id'),
    city_id: getNullableNumber(item, 'city_id'),
    email: nullableStringField(item.email),
    telegram: nullableStringField(item.telegram),
    telegram_id: getNullableNumber(item, 'telegram_id'),
    ads_count,
    adsRaw,
    avatar_url: nullableString(item.avatar_url),
    email_verified_at: nullableString(item.email_verified_at),
    region: mapUserRegionRef(item.region),
    city: mapUserRegionRef(item.city),
    media,
  }
}

/**
 * Laravel `Response` debug dumps wrap the real JSON as `{ headers, original, exception }`.
 * Unwrap every `original` link (sometimes nested). Normal HTTP responses have no `original`.
 */
export const normalizeAdminEnvelope = (raw: unknown): unknown => {
  let current: unknown = raw
  for (let depth = 0; depth < 8; depth++) {
    if (!current || typeof current !== 'object') break
    if (Array.isArray(current)) break

    const r = current as Record<string, unknown>
    let next = r.original

    if (typeof next === 'string') {
      const t = next.trim()
      if (t.startsWith('{') && t.endsWith('}')) {
        try {
          next = JSON.parse(next) as unknown
        } catch {
          break
        }
      } else {
        break
      }
    }

    if (next && typeof next === 'object' && !Array.isArray(next)) {
      current = next
      continue
    }
    break
  }
  return current
}

const PAGINATOR_COLLECTION_KEYS = ['data', 'items', 'results', 'rows', 'categories', 'subcategories'] as const

const looksLikePaginatorRecord = (value: unknown): value is UnknownRecord => {
  const record = asRecord(value)
  const hasCollection = PAGINATOR_COLLECTION_KEYS.some((key) => Array.isArray(record[key]))
  const hasMeta =
    'current_page' in record ||
    'currentPage' in record ||
    'per_page' in record ||
    'perPage' in record ||
    'total' in record ||
    'last_page' in record ||
    'lastPage' in record ||
    'links' in record ||
    'path' in record

  return hasCollection && hasMeta
}

const findPaginatorRecord = (value: unknown, depth = 0): UnknownRecord | undefined => {
  if (depth > 8 || !value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const record = asRecord(value)
  if (looksLikePaginatorRecord(record)) return record

  for (const nested of Object.values(record)) {
    const found = findPaginatorRecord(nested, depth + 1)
    if (found) return found
  }

  return undefined
}

export const mapPaginated = <T>(raw: unknown, mapItem: (row: UnknownRecord) => T): LaravelPaginated<T> => {
  const root = asRecord(normalizeAdminEnvelope(raw))
  const meta = asRecord(root.meta)
  const inner = root.data

  let page: UnknownRecord
  const discoveredPage = findPaginatorRecord(root)

  if (discoveredPage) {
    page = discoveredPage
  } else if (Array.isArray(inner)) {
    page = {
      data: inner,
      current_page:
        getNumber(meta, 'current_page', 'currentPage') ||
        getNumber(root, 'current_page', 'currentPage') ||
        1,
      per_page:
        getNumber(meta, 'per_page', 'perPage') ||
        getNumber(root, 'per_page', 'perPage') ||
        Math.max(inner.length, 1),
      total: getNumber(meta, 'total') || getNumber(root, 'total') || inner.length,
      last_page: getNumber(meta, 'last_page', 'lastPage') || getNumber(root, 'last_page', 'lastPage'),
    }
  } else if (inner && typeof inner === 'object') {
    page = inner as UnknownRecord
  } else {
    page = {}
  }

  const rows = asArray(page.data)
  let items = rows.length > 0 ? rows.map(mapItem) : extractCollection(page).map(mapItem)
  if (items.length === 0) {
    items = extractCollection(root).map(mapItem)
  }

  const currentPage =
    getNumber(page, 'current_page', 'currentPage') ||
    getNumber(meta, 'current_page', 'currentPage') ||
    getNumber(root, 'current_page', 'currentPage')
  const perPage =
    getNumber(page, 'per_page', 'perPage') ||
    getNumber(meta, 'per_page', 'perPage') ||
    getNumber(root, 'per_page', 'perPage')
  const total =
    getNumber(page, 'total') ||
    getNumber(meta, 'total') ||
    getNumber(root, 'total') ||
    items.length
  const lastFromApi =
    getNumber(page, 'last_page', 'lastPage') ||
    getNumber(meta, 'last_page', 'lastPage') ||
    getNumber(root, 'last_page', 'lastPage')
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

export const unwrapRecord = (raw: unknown): UnknownRecord => {
  const root = asRecord(normalizeAdminEnvelope(raw))
  const inner = root.data
  if (inner && typeof inner === 'object') return asRecord(inner)
  return root
}

export const buildAdminQuery = (params: Record<string, string | number | boolean | undefined | null>) => {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    qs.set(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}
