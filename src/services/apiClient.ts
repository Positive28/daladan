export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const DEFAULT_API_BASE_URL = 'https://api.daladan.uz/api/v1'
const REFRESH_PATH = '/refresh'
const SKIP_REFRESH_HEADER = 'x-skip-refresh'
const REFRESH_EXCLUDED_PATHS = ['/login', '/register', '/logout', REFRESH_PATH]
export const AUTH_STORAGE_KEY = 'daladan.auth'

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  return envUrl || DEFAULT_API_BASE_URL
}

const parseResponseData = async (response: Response) => {
  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }
  return data
}

const extractToken = (data: unknown) => {
  if (!data || typeof data !== 'object') return null
  const root = data as { token?: unknown; access_token?: unknown; jwt?: unknown; data?: unknown }
  const rootToken = [root.token, root.access_token, root.jwt].find(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  )
  if (rootToken) return rootToken

  if (!root.data || typeof root.data !== 'object') return null
  const nested = root.data as { token?: unknown; access_token?: unknown; jwt?: unknown }
  return [nested.token, nested.access_token, nested.jwt].find(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  ) ?? null
}

const readStoredAuthPayload = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return {} as { token?: unknown; user?: unknown }
    return JSON.parse(raw) as { token?: unknown; user?: unknown }
  } catch {
    return {} as { token?: unknown; user?: unknown }
  }
}

export const getStoredAuthToken = () => {
  const payload = readStoredAuthPayload()
  return typeof payload.token === 'string' && payload.token.trim() ? payload.token : null
}

export const setStoredAuthToken = (token: string | null | undefined) => {
  if (!token) return
  try {
    const current = readStoredAuthPayload()
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...current, token }))
  } catch {
    // Ignore storage sync errors.
  }
}

const toMessage = (status: number, data: unknown) => {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const maybeData = data as { message?: unknown; error?: unknown }
    if (typeof maybeData.message === 'string' && maybeData.message.trim()) return maybeData.message
    if (typeof maybeData.error === 'string' && maybeData.error.trim()) return maybeData.error
  }
  if (status === 401) return "Telefon raqam yoki parol noto'g'ri"
  if (status === 422) return "Kiritilgan ma'lumotlarda xatolik bor"
  return 'So\'rovni bajarib bo\'lmadi'
}

const shouldSkipRefresh = (path: string, init: RequestInit | undefined, hasAuthorizationHeader: boolean) => {
  if (hasAuthorizationHeader) return true
  if (REFRESH_EXCLUDED_PATHS.some((endpoint) => path.startsWith(endpoint))) return true
  const headers = new Headers(init?.headers)
  return headers.get(SKIP_REFRESH_HEADER) === '1'
}

const createHeaders = (init: RequestInit | undefined, token?: string | null) => {
  const isFormDataBody = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const headers = new Headers(init?.headers)

  if (!isFormDataBody && !headers.has('content-type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

const refreshAuthToken = async (baseUrl: string, expiredToken: string) => {
  const refreshResponse = await fetch(`${baseUrl}${REFRESH_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${expiredToken}`,
      [SKIP_REFRESH_HEADER]: '1',
    },
  })
  const refreshData = await parseResponseData(refreshResponse)
  if (!refreshResponse.ok) return null

  const nextToken = extractToken(refreshData)
  if (!nextToken) return null
  setStoredAuthToken(nextToken)
  return nextToken
}

export const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const baseUrl = getApiBaseUrl()
  const token = getStoredAuthToken()
  const normalizedHeaders = new Headers(init?.headers)
  const hasAuthorizationHeader = normalizedHeaders.has('authorization')

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: createHeaders(init, token),
  })
  const data = await parseResponseData(response)

  if (
    response.status === 401 &&
    token &&
    !shouldSkipRefresh(path, init, hasAuthorizationHeader)
  ) {
    const refreshedToken = await refreshAuthToken(baseUrl, token)
    if (refreshedToken) {
      const retryHeaders = createHeaders(init, refreshedToken)
      retryHeaders.delete(SKIP_REFRESH_HEADER)

      const retryResponse = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: retryHeaders,
      })
      const retryData = await parseResponseData(retryResponse)

      if (!retryResponse.ok) {
        throw new ApiError(toMessage(retryResponse.status, retryData), retryResponse.status, retryData)
      }

      return retryData as T
    }
  }

  if (!response.ok) {
    throw new ApiError(toMessage(response.status, data), response.status, data)
  }

  return data as T
}

