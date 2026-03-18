import { requestJson } from './apiClient'
import type { ProfileService } from './contracts'
import type { Profile } from '../types/marketplace'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const isNonEmptyRecord = (value: Record<string, unknown>) => Object.keys(value).length > 0

const getString = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string') return value
  }
  return ''
}

const mapProfile = (payload: unknown): Profile => {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const source =
    [asRecord(root.user), asRecord(data.user), asRecord(data.profile), data, root].find((candidate) =>
      isNonEmptyRecord(candidate),
    ) ?? {}
  const regionObj = asRecord(source.region)
  const cityObj = asRecord(source.city)

  const fname = getString(source, 'fname', 'first_name')
  const lname = getString(source, 'lname', 'last_name')
  const fullName = getString(source, 'full_name', 'fullName') || `${fname} ${lname}`.trim()
  const regionName =
    getString(regionObj, 'name_uz', 'name_oz', 'name') || getString(source, 'region_name', 'region')
  const cityName = getString(cityObj, 'name_uz', 'name_oz', 'name')

  return {
    fullName: fullName || 'Foydalanuvchi',
    phone: getString(source, 'phone'),
    region: [regionName, cityName].filter(Boolean).join(', ') || 'Uzbekistan',
    bio: getString(source, 'bio', 'about', 'description'),
  }
}

export const profileApiService: ProfileService = {
  async getProfile() {
    const response = await requestJson<unknown>('/profile')
    return mapProfile(response)
  },
}

