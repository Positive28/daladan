import type {
  AdPromotion,
  AdStats,
  BoostPlan,
  CategoryOption,
  CreateProfileAdPayload,
  Listing,
  Profile,
  ProfileAd,
  PromotionPlanResource,
  PublicAdsFilters,
  SubcategoryOption,
  UpdatePasswordPayload,
  UpdateProfileAdPayload,
  UpdateProfilePayload,
} from '../types/marketplace'

export interface MarketplaceService {
  getPublicAds(filters?: PublicAdsFilters): Promise<Listing[]>
  getPublicAdById(id: string | number): Promise<Listing | undefined>
  getProfileAds(perPage?: number, page?: number): Promise<Listing[]>
  getProfileAdById(adId: number): Promise<Listing | undefined>
  getProfileAdStats(adId: number): Promise<AdStats>
  getProfileAdPromotions(adId: number): Promise<AdPromotion[]>
  updateProfileAd(adId: number, payload: UpdateProfileAdPayload): Promise<ProfileAd>
  deleteProfileAd(adId: number): Promise<void>
  getListings(): Promise<Listing[]>
  getListingById(id: string): Promise<Listing | undefined>
  getBoostPlans(): Promise<BoostPlan[]>
  getPromotionPlans(): Promise<PromotionPlanResource[]>
  getCategories(): Promise<CategoryOption[]>
  getSubcategories(categoryId: number): Promise<SubcategoryOption[]>
  createProfileAd(payload: CreateProfileAdPayload): Promise<ProfileAd>
}

export interface ProfileService {
  getProfile(): Promise<Profile>
  updateProfile(payload: UpdateProfilePayload): Promise<Profile>
  updateAvatar(file: File): Promise<Profile>
  updatePassword(payload: UpdatePasswordPayload): Promise<void>
  getFavorites(): Promise<Listing[]>
  addFavorite(adId: number): Promise<void>
  removeFavorite(adId: number): Promise<void>
}

export interface GenerateAdDescriptionRequest {
  categoryName: string
  subcategoryName: string
  title?: string
  /** Formatted as in the input (e.g. "1 500 000") */
  priceText?: string
  unit?: string
  deliveryAvailable?: boolean
  regionName?: string
  districtName?: string
}

export interface AIService {
  generateAdDescription(payload: GenerateAdDescriptionRequest): Promise<string>
}

export interface RegionOption {
  id: number
  name: string
}

export interface CityOption {
  id: number
  name: string
  region_id?: number
}

export interface AuthUser {
  fullName: string
  phone: string
  region: string
  authMethod: 'password' | 'otp'
}

export interface LoginRequest {
  phone: string
  password: string
}

export interface RegisterRequest {
  phone: string
  password: string
  fname: string
  lname: string
  region_id: number
  city_id: number
  email?: string
  telegram?: string
}

export interface AuthResult {
  token?: string
  user: AuthUser
}

export interface AuthService {
  login(payload: LoginRequest): Promise<AuthResult>
  register(payload: RegisterRequest, authType?: 'password' | 'telegram'): Promise<AuthResult>
  /** `POST /refresh` — new bearer token; profile sync happens in auth layer after persist. */
  refresh(): Promise<AuthResult>
  getMe(): Promise<AuthUser>
  getRegions(): Promise<RegionOption[]>
  getCities(regionId?: number): Promise<CityOption[]>
  logout(): Promise<void>
}
