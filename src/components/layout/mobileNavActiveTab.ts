/** Which primary bottom tab is active for the marketplace mobile shell. */
export type MobileNavTabId = 'home' | 'search' | 'create' | 'favorites' | 'profile'

export function mobileNavActiveTab(pathname: string): MobileNavTabId | null {
  if (pathname === '/') return 'home'
  if (pathname === '/search') return 'search'
  if (pathname.startsWith('/profile/ads/new')) return 'create'
  if (pathname === '/favorites') return 'favorites'
  if (pathname.startsWith('/ad-boost/')) return 'profile'
  if (pathname.startsWith('/profile')) return 'profile'
  return null
}
