import type { MarketplaceService, ProfileService } from './contracts'
import { mockMarketplaceService, mockProfileService } from './mockServices'

export const marketplaceService: MarketplaceService = mockMarketplaceService
export const profileService: ProfileService = mockProfileService
