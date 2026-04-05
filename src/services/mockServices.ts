import { boostPlans, listings, profile } from '../data/mockData'
import type { MarketplaceService, ProfileService } from './contracts'
import type { CreateProfileAdPayload, UpdatePasswordPayload, UpdateProfileAdPayload, UpdateProfilePayload } from '../types/marketplace'

const simulateLatency = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 150)
  })
}

export const mockMarketplaceService: MarketplaceService = {
  async getPublicAds() {
    await simulateLatency()
    return listings
  },
  async getPublicAdById(id) {
    await simulateLatency()
    return listings.find((listing) => listing.id === String(id))
  },
  async getProfileAds() {
    await simulateLatency()
    return listings.slice(0, 2)
  },
  async getProfileAdById(adId: number) {
    await simulateLatency()
    return listings.find((listing) => listing.id === String(adId))
  },
  async updateProfileAd(adId: number, payload: UpdateProfileAdPayload) {
    await simulateLatency()
    void payload
    return { id: adId }
  },
  async deleteProfileAd(adId: number) {
    await simulateLatency()
    void adId
  },
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
  async getCategories() {
    await simulateLatency()
    return []
  },
  async getSubcategories(categoryId: number) {
    await simulateLatency()
    void categoryId
    return []
  },
  async createProfileAd(payload: CreateProfileAdPayload) {
    await simulateLatency()
    void payload
    return { id: 0 }
  },
}

export const mockProfileService: ProfileService = {
  async getProfile() {
    await simulateLatency()
    return profile
  },
  async updateProfile(payload: UpdateProfilePayload) {
    await simulateLatency()
    void payload
    return profile
  },
  async updateAvatar(file: File) {
    await simulateLatency()
    void file
    return profile
  },
  async updatePassword(payload: UpdatePasswordPayload) {
    await simulateLatency()
    void payload
  },
}
