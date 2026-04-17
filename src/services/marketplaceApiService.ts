import { boostPlans } from '../data/boostPlans'
import type {
  BoostPlan,
  CategoryOption,
  CreateProfileAdPayload,
  Listing,
  ProfileAd,
  PublicAdsFilters,
  SubcategoryOption,
  UpdateProfileAdPayload,
} from '../types/marketplace'
import { ApiError, requestJson } from './apiClient'
import {
  asRecord,
  extractCollection,
  getBoolean,
  getNumber,
  getString,
  isNonEmptyRecord,
  pickFirstRecord,
  type UnknownRecord,
} from './apiMappers'
import type { MarketplaceService } from './contracts'

/**
 * Create form uses Uzbek labels; API expects a string unit (backend rule: length > 3).
 * Values use readable English tokens / snake_case (min 4 characters each).
 */
const UI_TO_API_UNIT: Record<string, string> = {
  kg: 'kilogram',
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
  m2: 'square_meter',
  m3: 'cubic_meter',
  sotix: 'sotix',
  gektar: 'hectare',
  bosh: 'generic',
  "to'plam": 'set_pack',
  karobka: 'carton',
  paket: 'packet',
}

const mapUiUnitToApi = (raw: string) => {
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

const mapCategory = (item: UnknownRecord): CategoryOption => {
  const slugRaw = getString(item, 'slug', 'slug_en', 'slug_uz')
  return {
    id: getNumber(item, 'id', 'category_id'),
    name: getString(item, 'name_uz', 'name_oz', 'name', 'title'),
    ...(slugRaw ? { slug: slugRaw } : {}),
  }
}

const mapSubcategory =
  (fallbackCategoryId: number) =>
  (item: UnknownRecord): SubcategoryOption => {
    const id = getNumber(item, 'id', 'subcategory_id')
    const categoryIdFromApi = getNumber(item, 'category_id', 'parent_id')
    const categoryId = categoryIdFromApi > 0 ? categoryIdFromApi : fallbackCategoryId
    const slugRaw = getString(item, 'slug', 'slug_en', 'slug_uz')
    const rawImage = item.image_url
    const image_url =
      rawImage === null || rawImage === undefined
        ? null
        : typeof rawImage === 'string' && rawImage.trim()
          ? rawImage.trim()
          : null
    const mediaUrls = getMediaUrls(item.media)
    const isActiveRaw = item.is_active
    const is_active = isActiveRaw === undefined ? true : Boolean(isActiveRaw)

    return {
      id,
      categoryId,
      name: getString(item, 'name_uz', 'name_oz', 'name', 'title'),
      ...(slugRaw ? { slug: slugRaw } : {}),
      image_url,
      ...(mediaUrls.length ? { media: mediaUrls } : {}),
      is_active,
    }
  }

const getIdString = (item: UnknownRecord) => {
  const numericId = getNumber(item, 'id', 'ad_id')
  if (numericId > 0) return String(numericId)
  return getString(item, 'id', 'ad_id')
}

const normalizeMediaUrl = (url: string) => url.replace(/([^:]\/)\/+/g, '$1')

const getMediaUrls = (media: unknown): string[] => {
  if (!Array.isArray(media)) return []
  const out: string[] = []
  for (const rawItem of media) {
    if (typeof rawItem === 'string' && rawItem.trim()) {
      out.push(normalizeMediaUrl(rawItem.trim()))
      continue
    }
    const item = asRecord(rawItem)
    const url = getString(item, 'url', 'path', 'src', 'full_url', 'original_url', 'thumbnail', 'thumb', 'preview_url')
    if (url) out.push(normalizeMediaUrl(url))
  }
  return out
}

const uniqueLocationParts = (parts: string[]) => {
  const seen = new Set<string>()
  const next: string[] = []
  for (const raw of parts) {
    const p = raw.trim()
    if (!p) continue
    const key = p.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    next.push(p)
  }
  return next
}

const toDisplayQuantity = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : String(value)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return ''
    const parsed = Number(trimmed)
    if (Number.isNaN(parsed)) return trimmed
    return Number.isInteger(parsed) ? String(parsed) : String(parsed)
  }
  return ''
}

/** Shared by admin user ads list; maps API ad rows to marketplace `Listing`. */
export const mapListing = (item: UnknownRecord): Listing => {
  const categoryObj = asRecord(item.category)
  const subcategoryObj = asRecord(item.subcategory)
  const regionObj = asRecord(item.region)
  const cityObj = asRecord(item.city)
  const ownerObj = pickFirstRecord(item.user, item.owner, item.seller)
  const ownerRegionObj = asRecord(ownerObj.region)
  const ownerCityObj = asRecord(ownerObj.city)
  const categoryName = getString(categoryObj, 'name_uz', 'name_oz', 'name', 'title') || getString(item, 'category_name', 'category')
  const subcategoryName =
    getString(subcategoryObj, 'name_uz', 'name_oz', 'name', 'title') || getString(item, 'subcategory_name', 'subcategory')
  const regionName =
    getString(regionObj, 'name_uz', 'name_oz', 'name') ||
    getString(ownerRegionObj, 'name_uz', 'name_oz', 'name') ||
    getString(item, 'region_name', 'region')
  const cityName =
    getString(cityObj, 'name_uz', 'name_oz', 'name') ||
    getString(ownerCityObj, 'name_uz', 'name_oz', 'name') ||
    getString(item, 'city_name', 'city')
  const districtName = getString(item, 'district')
  const locationExtra = getString(item, 'location')
  const rawUnit = getString(item, 'unit')
  const quantityValue = toDisplayQuantity(item.quantity)
  const sellerName =
    getString(ownerObj, 'full_name', 'fullName') ||
    [getString(ownerObj, 'fname', 'first_name'), getString(ownerObj, 'lname', 'last_name')].filter(Boolean).join(' ').trim() ||
    'Sotuvchi'
  const deliveryInfoRaw = getString(item, 'delivery_info', 'delivery', 'deliveryInfo')
  const hasDeliveryFlag = Object.prototype.hasOwnProperty.call(item, 'delivery_available')
  const deliveryInfo = deliveryInfoRaw || (hasDeliveryFlag ? (getBoolean(item, 'delivery_available') ? 'Mavjud' : "Mavjud emas") : '')
  const unit = rawUnit ? `so'm / ${rawUnit}` : "so'm"
  const quantity = [quantityValue, rawUnit].filter(Boolean).join(' ').trim()
  const mediaUrls = [...getMediaUrls(item.media), ...getMediaUrls(item.media_list)]
  const ownerMediaUrls = getMediaUrls(ownerObj.media)
  const mergedImages = [...new Set([...mediaUrls, ...ownerMediaUrls].filter(Boolean))]
  const imageUrl =
    mergedImages[0] ||
    getString(item, 'image', 'image_url', 'photo')

  const subcategoryIdRaw =
    getNumber(subcategoryObj, 'id', 'subcategory_id') || getNumber(item, 'subcategory_id')
  const subcategoryId = subcategoryIdRaw > 0 ? subcategoryIdRaw : undefined

  const hasViewsField =
    Object.prototype.hasOwnProperty.call(item, 'views_count') ||
    Object.prototype.hasOwnProperty.call(item, 'viewsCount')
  const viewsCount = hasViewsField ? getNumber(item, 'views_count', 'viewsCount') : undefined

  return {
    id: getIdString(item) || '0',
    title: getString(item, 'title', 'name') || "Nomsiz e'lon",
    category: subcategoryName || categoryName || 'Kategoriya',
    categoryPath: [categoryName, subcategoryName].filter(Boolean),
    kind: getString(item, 'kind', 'type') === 'service' ? 'service' : 'item',
    location:
      uniqueLocationParts([regionName, cityName, districtName, locationExtra].filter(Boolean)).join(', ') || "Noma'lum hudud",
    price: getNumber(item, 'price', 'amount'),
    unit,
    isTopSale: getBoolean(item, 'is_top_sale', 'top_sale', 'is_top'),
    isBoosted: getBoolean(item, 'is_boosted', 'boosted'),
    isFresh: getBoolean(item, 'is_fresh', 'fresh'),
    phone: getString(item, 'phone') || getString(ownerObj, 'phone'),
    sellerName,
    sellerTelegram: getString(ownerObj, 'telegram', 'telegram_username') || undefined,
    description: getString(item, 'description', 'desc') || "Tavsif ko'rsatilmagan",
    quantity: quantity || undefined,
    deliveryInfo: deliveryInfo || undefined,
    image: imageUrl || '/daladan-logo-full-transparent.png',
    images: mergedImages.length > 0 ? mergedImages : undefined,
    status: getString(item, 'status') || undefined,
    createdAt: getString(item, 'created_at', 'createdAt') || undefined,
    subcategoryId,
    viewsCount,
  }
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return
    query.set(key, String(value))
  })
  const value = query.toString()
  return value ? `?${value}` : ''
}

const extractSingleAd = (payload: unknown) => {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  return [
    asRecord(root.ad),
    asRecord(root.item),
    asRecord(root.listing),
    asRecord(data.ad),
    asRecord(data.item),
    asRecord(data.listing),
    data,
    root,
  ].find((candidate) => isNonEmptyRecord(candidate))
}

const mapCreatedAd = (payload: unknown): ProfileAd => {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const source = [data, root].find((candidate) => isNonEmptyRecord(candidate)) ?? {}
  const id = getNumber(source, 'id', 'ad_id')
  return { id }
}

const toBasePayload = (payload: CreateProfileAdPayload | UpdateProfileAdPayload) => {
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

const canRetryWithJson = (error: unknown) =>
  error instanceof ApiError && [400, 415, 422].includes(error.status)

const createMultipartBody = (payload: CreateProfileAdPayload | UpdateProfileAdPayload) => {
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

const createProfileAd = async (payload: CreateProfileAdPayload): Promise<ProfileAd> => {
  const files = payload.files ?? []
  const jsonPayload = toBasePayload(payload)

  if (files.length > 0) {
    try {
      const multipartResponse = await requestJson<unknown>('/profile/ads', {
        method: 'POST',
        body: createMultipartBody(payload),
      })
      return mapCreatedAd(multipartResponse)
    } catch (error) {
      const canRetry = canRetryWithJson(error)
      const hasMediaUrls = payload.media.length > 0
      if (!canRetry || !hasMediaUrls) {
        throw error
      }
    }
  }

  const response = await requestJson<unknown>('/profile/ads', {
    method: 'POST',
    body: JSON.stringify(jsonPayload),
  })
  return mapCreatedAd(response)
}

const updateProfileAd = async (adId: number, payload: UpdateProfileAdPayload): Promise<ProfileAd> => {
  const files = payload.files ?? []
  const jsonPayload = toBasePayload(payload)

  if (files.length > 0) {
    try {
      const multipartResponse = await requestJson<unknown>(`/profile/ads/${adId}`, {
        method: 'POST',
        body: createMultipartBody(payload),
      })
      return mapCreatedAd(multipartResponse)
    } catch (error) {
      if (!canRetryWithJson(error) || !Array.isArray(payload.media) || payload.media.length === 0) {
        throw error
      }
    }
  }

  const response = await requestJson<unknown>(`/profile/ads/${adId}`, {
    method: 'PATCH',
    body: JSON.stringify(jsonPayload),
  })
  return mapCreatedAd(response)
}

const mapListingCollection = (payload: unknown) =>
  extractCollection(payload).map(mapListing).filter((listing) => listing.id !== '0')

export const marketplaceApiService: MarketplaceService = {
  async getPublicAds(filters?: PublicAdsFilters) {
    const query = buildQuery({
      per_page: filters?.perPage,
      category_id: filters?.categoryId,
      subcategory_id: filters?.subcategoryId,
    })
    const response = await requestJson<unknown>(`/public/ads${query}`)
    return mapListingCollection(response)
  },

  async getPublicAdById(id: string | number) {
    const response = await requestJson<unknown>(`/public/ads/${id}`)
    const ad = extractSingleAd(response)
    return ad ? mapListing(ad) : undefined
  },

  async getProfileAds(perPage = 15, page?: number) {
    const query = buildQuery({
      per_page: perPage,
      ...(page !== undefined ? { page } : {}),
    })
    const response = await requestJson<unknown>(`/profile/ads${query}`)
    return mapListingCollection(response)
  },

  async getProfileAdById(adId: number) {
    const response = await requestJson<unknown>(`/profile/ads/${adId}`)
    const ad = extractSingleAd(response)
    return ad ? mapListing(ad) : undefined
  },

  async updateProfileAd(adId: number, payload: UpdateProfileAdPayload) {
    return updateProfileAd(adId, payload)
  },

  async deleteProfileAd(adId: number) {
    await requestJson<unknown>(`/profile/ads/${adId}`, { method: 'DELETE' })
  },

  async getListings() {
    return this.getPublicAds()
  },

  async getListingById(id: string) {
    return this.getPublicAdById(id)
  },

  async getBoostPlans(): Promise<BoostPlan[]> {
    return boostPlans
  },

  async getCategories() {
    const response = await requestJson<unknown>('/resources/categories')
    return extractCollection(response).map(mapCategory).filter((item) => item.id > 0 && Boolean(item.name))
  },

  async getSubcategories(categoryId: number) {
    const response = await requestJson<unknown>(`/resources/subcategories?category_id=${categoryId}`)
    return extractCollection(response)
      .map(mapSubcategory(categoryId))
      .filter((item) => item.id > 0 && item.categoryId > 0 && Boolean(item.name))
      .filter((item) => item.is_active !== false)
  },

  createProfileAd,
}
