export type ListingKind = 'item' | 'service'

export interface Listing {
  id: string
  title: string
  category: string
  categoryPath?: string[]
  kind: ListingKind
  location: string
  price: number
  unit: string
  isTopSale?: boolean
  isBoosted?: boolean
  isFresh?: boolean
  phone: string
  sellerName?: string
  sellerTelegram?: string
  description: string
  quantity?: string
  deliveryInfo?: string
  image: string
  /** All gallery image URLs when the API returns multiple media items */
  images?: string[]
  /** Raw ad status from API, e.g. active, expired */
  status?: string
  /** ISO datetime from API when available */
  createdAt?: string
}

export interface Profile {
  fullName: string
  phone: string
  region: string
  bio: string
  email?: string
  telegram?: string
  avatarUrl?: string
  regionId?: number
  cityId?: number
}

export interface BoostPlan {
  id: string
  name: string
  price: number
  description: string
  badge?: string
}

export interface CategoryOption {
  id: number
  name: string
  /** API slug for URLs and tile imagery, e.g. fruit / poultry / animal */
  slug?: string
}

export interface SubcategoryOption {
  id: number
  categoryId: number
  name: string
}

export interface CreateProfileAdPayload {
  category_id: number
  subcategory_id: number
  region_id?: number
  city_id?: number
  district?: string
  title: string
  description: string
  price?: number
  quantity?: number
  quantity_description?: string
  unit?: string
  delivery_available?: boolean
  delivery_info?: string
  media: string[]
  files?: File[]
}

export interface UpdateProfileAdPayload {
  category_id?: number
  subcategory_id?: number
  region_id?: number
  city_id?: number
  district?: string
  title?: string
  description?: string
  price?: number
  quantity?: number
  quantity_description?: string
  unit?: string
  delivery_available?: boolean
  delivery_info?: string
  media?: string[]
  files?: File[]
}

export interface ProfileAd {
  id: number
}

export interface PublicAdsFilters {
  perPage?: number
  categoryId?: number
  subcategoryId?: number
}

export interface UpdateProfilePayload {
  fname?: string
  lname?: string
  email?: string
  telegram?: string
  region_id?: number
  city_id?: number
}

export interface UpdatePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}
