import { extractAuthToken, requestJson } from './apiClient'
import {
  asRecord,
  extractCollection,
  getNumber,
  getString,
  isNonEmptyRecord,
  type UnknownRecord,
} from './apiMappers'
import type {
  AuthResult,
  AuthService,
  AuthUser,
  CityOption,
  LoginRequest,
  RegionOption,
  RegisterRequest,
} from './contracts'

const mapRegion = (item: UnknownRecord): RegionOption => ({
  id: getNumber(item, 'id', 'region_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title', 'region_name'),
})

const mapCity = (item: UnknownRecord): CityOption => ({
  id: getNumber(item, 'id', 'city_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title', 'city_name'),
  region_id: getNumber(item, 'region_id') || undefined,
})

const mapAuthUser = (payload: unknown, fallback: { phone: string; fullName: string }): AuthUser => {
  const data = asRecord(payload)
  const regionObj = asRecord(data.region)
  const cityObj = asRecord(data.city)
  const fname = getString(data, 'fname', 'first_name')
  const lname = getString(data, 'lname', 'last_name')
  const fullName = getString(data, 'full_name', 'fullName') || `${fname} ${lname}`.trim() || fallback.fullName
  const phone = getString(data, 'phone') || fallback.phone
  const regionName =
    getString(regionObj, 'name_uz', 'name_oz', 'name') || getString(data, 'region_name', 'region')
  const cityName = getString(cityObj, 'name_uz', 'name_oz', 'name')
  const region = [regionName, cityName].filter(Boolean).join(', ') || 'Uzbekistan'

  return {
    fullName,
    phone,
    region,
    authMethod: 'password',
  }
}

const mapAuthResult = (payload: unknown, fallback: { phone: string; fullName: string }): AuthResult => {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const userBlock =
    [asRecord(root.user), asRecord(data.user), data, root].find((candidate) => isNonEmptyRecord(candidate)) ?? {}
  const token = extractAuthToken(payload) ?? undefined

  return {
    token,
    user: mapAuthUser(userBlock, fallback),
  }
}

export const authApiService: AuthService = {
  async login(payload: LoginRequest) {
    const response = await requestJson<unknown>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return mapAuthResult(response, {
      phone: payload.phone,
      fullName: 'Foydalanuvchi',
    })
  },

  async register(payload: RegisterRequest, authType = 'password') {
    const response = await requestJson<unknown>(`/register?auth_type=${authType}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return mapAuthResult(response, {
      phone: payload.phone,
      fullName: `${payload.fname} ${payload.lname}`.trim(),
    })
  },

  async getMe() {
    const response = await requestJson<unknown>('/profile')
    const root = asRecord(response)
    const data = asRecord(root.data)
    const userBlock =
      [asRecord(root.user), asRecord(data.user), data, root].find((candidate) => isNonEmptyRecord(candidate)) ?? {}

    return mapAuthUser(userBlock, {
      phone: '',
      fullName: 'Foydalanuvchi',
    })
  },

  async getRegions() {
    const response = await requestJson<unknown>('/resources/regions')
    return extractCollection(response).map(mapRegion).filter((item) => item.id > 0 && Boolean(item.name))
  },

  async getCities(regionId?: number) {
    const query = typeof regionId === 'number' ? `?region_id=${regionId}` : ''
    const response = await requestJson<unknown>(`/resources/cities${query}`)
    return extractCollection(response).map(mapCity).filter((item) => item.id > 0 && Boolean(item.name))
  },

  async logout() {
    await requestJson<unknown>('/logout', { method: 'POST' })
  },
}

