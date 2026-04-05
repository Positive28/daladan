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
  description: string
  image: string
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
}

export interface SubcategoryOption {
  id: number
  categoryId: number
  name: string
}

export interface CreateProfileAdPayload {
  category_id: number
  subcategory_id: number
  district: string
  title: string
  description: string
  price: number
  quantity: number
  quantity_description: string
  unit: string
  delivery_info: string
  media: string[]
  files?: File[]
}

export interface UpdateProfileAdPayload {
  category_id?: number
  subcategory_id?: number
  district?: string
  title?: string
  description?: string
  price?: number
  quantity?: number
  quantity_description?: string
  unit?: string
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
