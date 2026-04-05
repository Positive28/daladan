import { requestJson } from './apiClient'
import { asRecord, getNumber, getString, isNonEmptyRecord } from './apiMappers'
import type { ProfileService } from './contracts'
import type { Profile, UpdatePasswordPayload, UpdateProfilePayload } from '../types/marketplace'

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
    email: getString(source, 'email') || undefined,
    telegram: getString(source, 'telegram') || undefined,
    avatarUrl: getString(source, 'avatar', 'avatar_url', 'photo') || undefined,
    regionId: getNumber(source, 'region_id') || undefined,
    cityId: getNumber(source, 'city_id') || undefined,
  }
}

export const profileApiService: ProfileService = {
  async getProfile() {
    const response = await requestJson<unknown>('/profile')
    return mapProfile(response)
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const response = await requestJson<unknown>('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapProfile(response)
  },

  async updateAvatar(file: File) {
    const body = new FormData()
    body.append('avatar', file)
    const response = await requestJson<unknown>('/profile/avatar', {
      method: 'POST',
      body,
    })
    return mapProfile(response)
  },

  async updatePassword(payload: UpdatePasswordPayload) {
    await requestJson<unknown>('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

