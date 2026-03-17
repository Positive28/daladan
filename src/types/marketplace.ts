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
}

export interface BoostPlan {
  id: string
  name: string
  price: number
  description: string
  badge?: string
}
