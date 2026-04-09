import type { AIService, AuthService, MarketplaceService, ProfileService } from './contracts'
import { adminApiService } from './adminApiService'
import { aiApiService } from './aiApiService'
import { authApiService } from './authApiService'
import { marketplaceApiService } from './marketplaceApiService'
import { profileApiService } from './profileApiService'

export const marketplaceService: MarketplaceService = marketplaceApiService
export const profileService: ProfileService = profileApiService
export const authService: AuthService = authApiService
export const aiService: AIService = aiApiService
export { adminApiService }
