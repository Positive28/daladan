import { boostPlans, listings, profile } from '../data/mockData'
import type { MarketplaceService, ProfileService } from './contracts'

const simulateLatency = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 150)
  })
}

export const mockMarketplaceService: MarketplaceService = {
  async getListings() {
    await simulateLatency()
    return listings
  },
  async getListingById(id) {
    await simulateLatency()
    return listings.find((listing) => listing.id === id)
  },
  async getBoostPlans() {
    await simulateLatency()
    return boostPlans
  },
}

export const mockProfileService: ProfileService = {
  async getProfile() {
    await simulateLatency()
    return profile
  },
}
