import { requestJson } from './apiClient'
import type {
  AuthResult,
  AuthService,
  AuthUser,
  CityOption,
  LoginRequest,
  RegionOption,
  RegisterRequest,
} from './contracts'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const isNonEmptyRecord = (value: Record<string, unknown>) => Object.keys(value).length > 0

const asArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    : []

const extractCollection = (value: unknown): Record<string, unknown>[] => {
  const direct = asArray(value)
  if (direct.length > 0) return direct

  const root = asRecord(value)
  return asArray(root.data)
}

const getNumber = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

const getString = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string') return value
  }
  return ''
}

const mapRegion = (item: Record<string, unknown>): RegionOption => ({
  id: getNumber(item, 'id', 'region_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title', 'region_name'),
})

const mapCity = (item: Record<string, unknown>): CityOption => ({
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
  const token =
    getString(root, 'token', 'access_token', 'jwt') ||
    getString(data, 'token', 'access_token', 'jwt') ||
    undefined

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

