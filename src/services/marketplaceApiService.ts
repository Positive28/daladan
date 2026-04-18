import { boostPlans } from '../data/boostPlans'
import type {
  AdPromotion,
  AdStats,
  BoostPlan,
  CategoryOption,
  CreateProfileAdPayload,
  Listing,
  ProfileAd,
  PromotionPlanResource,
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
import { extractPromotionRows, mapAdPromotion } from './adPromotionMappers'
import { extractStatsRecord, mapAdStats } from './adStatsMappers'
import {
  canRetryWithJson,
  createMultipartBody,
  toBasePayload,
} from './profileAdPayloadBuilders'
import { buildPromotionPlanFallbacks } from '../utils/promotionPlanFallbacks'

const pickNullablePrice = (item: UnknownRecord): number | null => {
  for (const key of ['price', 'amount', 'total']) {
    const v = item[key]
    if (v === null || v === undefined) continue
    if (typeof v === 'number' && !Number.isNaN(v)) return v
    if (typeof v === 'string') {
      const n = Number(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return null
}

const mapPromotionPlanResource = (item: UnknownRecord, index: number): PromotionPlanResource | null => {
  const numericId = getNumber(item, 'id')
  const slug = getString(item, 'slug', 'code').trim()
  const id = numericId > 0 ? String(numericId) : slug || `plan-${index}`
  const label = getString(item, 'name_uz', 'name_oz', 'name', 'title', 'label').trim()
  const durationDaysRaw = getNumber(item, 'duration_days', 'duration_in_days', 'days', 'duration')
  const durationDays = durationDaysRaw > 0 ? durationDaysRaw : 7
  if (!label) return null
  const kindRaw = getString(item, 'kind', 'type', 'promotion_type', 'plan_kind', 'promotion_kind')
  return {
    id,
    label,
    durationDays,
    ...(kindRaw ? { kind: kindRaw } : {}),
    price: pickNullablePrice(item),
  }
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

const mapBoostPlanRow = (item: UnknownRecord): BoostPlan => {
  const numericId = getNumber(item, 'id', 'plan_id')
  const id =
    numericId > 0
      ? String(numericId)
      : getString(item, 'slug', 'code', 'key', 'plan_key', 'type') || 'plan'
  const price = getNumber(item, 'price', 'amount', 'cost', 'sum', 'price_uzs')
  const name = getString(item, 'name_uz', 'name_oz', 'name', 'title', 'label')
  const description = getString(item, 'description_uz', 'description', 'description_oz', 'summary')
  const badgeRaw = getString(item, 'badge', 'badge_label', 'label')
  return {
    id,
    name: name || id,
    price,
    description: description || '',
    ...(badgeRaw ? { badge: badgeRaw } : {}),
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

export const mapListingCollection = (payload: unknown) =>
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

  async getProfileAdStats(adId: number): Promise<AdStats> {
    const response = await requestJson<unknown>(`/profile/ads/${adId}/stats`)
    return mapAdStats(extractStatsRecord(response))
  },

  async getProfileAdPromotions(adId: number): Promise<AdPromotion[]> {
    try {
      const response = await requestJson<unknown>(`/profile/ads/${adId}/promotions`)
      return extractPromotionRows(response).map(mapAdPromotion)
    } catch (e) {
      if (e instanceof ApiError && (e.status === 405 || e.status === 404 || e.status === 501)) {
        return []
      }
      throw e
    }
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
    try {
      const response = await requestJson<unknown>('/resources/promotion-plans')
      const mapped = extractCollection(response)
        .map((raw) => mapBoostPlanRow(asRecord(raw)))
        .filter((plan) => Boolean(plan.id && plan.name))
      if (mapped.length > 0) return mapped
    } catch {
      // Public catalog unavailable — keep checkout usable.
    }
    return boostPlans
  },

  async getPromotionPlans(): Promise<PromotionPlanResource[]> {
    try {
      const response = await requestJson<unknown>('/resources/promotion-plans')
      const mapped = extractCollection(response)
        .map((raw, i) => mapPromotionPlanResource(asRecord(raw), i))
        .filter((r): r is PromotionPlanResource => r !== null)
      if (mapped.length > 0) return mapped
    } catch {
      // fall through to static catalog
    }
    return buildPromotionPlanFallbacks()
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
