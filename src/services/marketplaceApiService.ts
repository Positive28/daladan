import { boostPlans } from '../data/mockData'
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

const mapCategory = (item: UnknownRecord): CategoryOption => ({
  id: getNumber(item, 'id', 'category_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title'),
})

const mapSubcategory = (item: UnknownRecord): SubcategoryOption => ({
  id: getNumber(item, 'id', 'subcategory_id'),
  categoryId: getNumber(item, 'category_id', 'parent_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title'),
})

const getIdString = (item: UnknownRecord) => {
  const numericId = getNumber(item, 'id', 'ad_id')
  if (numericId > 0) return String(numericId)
  return getString(item, 'id', 'ad_id')
}

const getMediaUrl = (media: unknown) => {
  if (!Array.isArray(media)) return ''
  for (const rawItem of media) {
    if (typeof rawItem === 'string' && rawItem.trim()) return rawItem
    const item = asRecord(rawItem)
    const url = getString(item, 'url', 'path', 'src', 'full_url', 'original_url', 'thumbnail', 'thumb')
    if (url) return url
  }
  return ''
}

const mapListing = (item: UnknownRecord): Listing => {
  const categoryObj = asRecord(item.category)
  const subcategoryObj = asRecord(item.subcategory)
  const regionObj = asRecord(item.region)
  const cityObj = asRecord(item.city)
  const ownerObj = pickFirstRecord(item.user, item.owner, item.seller)
  const categoryName = getString(categoryObj, 'name_uz', 'name_oz', 'name', 'title') || getString(item, 'category_name', 'category')
  const subcategoryName =
    getString(subcategoryObj, 'name_uz', 'name_oz', 'name', 'title') || getString(item, 'subcategory_name', 'subcategory')
  const regionName =
    getString(regionObj, 'name_uz', 'name_oz', 'name') || getString(item, 'region_name', 'region')
  const cityName = getString(cityObj, 'name_uz', 'name_oz', 'name') || getString(item, 'city_name', 'city')
  const districtName = getString(item, 'district')
  const rawUnit = getString(item, 'unit')
  const unit = rawUnit ? `so'm / ${rawUnit}` : "so'm"

  return {
    id: getIdString(item) || '0',
    title: getString(item, 'title', 'name') || "Nomsiz e'lon",
    category: subcategoryName || categoryName || 'Kategoriya',
    categoryPath: [categoryName, subcategoryName].filter(Boolean),
    kind: getString(item, 'kind', 'type') === 'service' ? 'service' : 'item',
    location: [regionName, cityName, districtName, getString(item, 'location')].filter(Boolean).join(', ') || 'Noma\'lum hudud',
    price: getNumber(item, 'price', 'amount'),
    unit,
    isTopSale: getBoolean(item, 'is_top_sale', 'top_sale', 'is_top'),
    isBoosted: getBoolean(item, 'is_boosted', 'boosted'),
    isFresh: getBoolean(item, 'is_fresh', 'fresh'),
    phone: getString(item, 'phone') || getString(ownerObj, 'phone'),
    description: getString(item, 'description', 'desc') || "Tavsif ko'rsatilmagan",
    image: getMediaUrl(item.media) || getString(item, 'image', 'image_url', 'photo') || '/daladan-logo-full-transparent.png',
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
  assign('district', payload.district)
  assign('title', payload.title)
  assign('description', payload.description)
  assign('price', payload.price)
  assign('quantity', payload.quantity)
  assign('quantity_description', payload.quantity_description)
  assign('unit', payload.unit)
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

  append('category_id', payload.category_id)
  append('subcategory_id', payload.subcategory_id)
  append('district', payload.district)
  append('title', payload.title)
  append('description', payload.description)
  append('price', payload.price)
  append('quantity', payload.quantity)
  append('quantity_description', payload.quantity_description)
  append('unit', payload.unit)
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
      if (!canRetryWithJson(error) || payload.media.length === 0) {
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

  async getProfileAds(perPage = 15) {
    const query = buildQuery({ per_page: perPage })
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
      .map(mapSubcategory)
      .filter((item) => item.id > 0 && item.categoryId > 0 && Boolean(item.name))
  },

  createProfileAd,
}
