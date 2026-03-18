import type { BoostPlan, Listing, Profile } from '../types/marketplace'

export interface MarketplaceService {
  getListings(): Promise<Listing[]>
  getListingById(id: string): Promise<Listing | undefined>
  getBoostPlans(): Promise<BoostPlan[]>
}

export interface ProfileService {
  getProfile(): Promise<Profile>
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
  getMe(): Promise<AuthUser>
  getRegions(): Promise<RegionOption[]>
  getCities(regionId?: number): Promise<CityOption[]>
  logout(): Promise<void>
}
