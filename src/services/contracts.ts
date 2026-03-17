import type { BoostPlan, Listing, Profile } from '../types/marketplace'

export interface MarketplaceService {
  getListings(): Promise<Listing[]>
  getListingById(id: string): Promise<Listing | undefined>
  getBoostPlans(): Promise<BoostPlan[]>
}

export interface ProfileService {
  getProfile(): Promise<Profile>
}
