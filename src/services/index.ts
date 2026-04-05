import type { AuthService, MarketplaceService, ProfileService } from './contracts'
import { authApiService } from './authApiService'
import { marketplaceApiService } from './marketplaceApiService'
import { profileApiService } from './profileApiService'

export const marketplaceService: MarketplaceService = marketplaceApiService
export const profileService: ProfileService = profileApiService
export const authService: AuthService = authApiService
