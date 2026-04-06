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
const AUTH_ERROR_STATUS = 401
const NETWORK_ERROR_STATUS = 0
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

const readTokenFromBlock = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return null
  const block = payload as { token?: unknown; access_token?: unknown; accessToken?: unknown; jwt?: unknown }
  return [block.token, block.access_token, block.accessToken, block.jwt].find(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  ) ?? null
}

export const extractAuthToken = (data: unknown) => {
  if (!data || typeof data !== 'object') return null
  const root = data as { token?: unknown; access_token?: unknown; accessToken?: unknown; jwt?: unknown; data?: unknown }
  const rootToken = readTokenFromBlock(root)
  if (rootToken) return rootToken

  return readTokenFromBlock(root.data)
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
  return extractAuthToken(payload)
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

const firstLaravelValidationMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null
  const errors = (data as { errors?: unknown }).errors
  if (!errors || typeof errors !== 'object') return null
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0].trim()
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

const toMessage = (status: number, data: unknown) => {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const maybeData = data as { message?: unknown; error?: unknown }
    if (typeof maybeData.message === 'string' && maybeData.message.trim()) return maybeData.message
    if (typeof maybeData.error === 'string' && maybeData.error.trim()) return maybeData.error
    const validation = firstLaravelValidationMessage(data)
    if (validation) return validation
  }
  if (status === 401) return "Telefon raqam yoki parol noto'g'ri"
  if (status === 422) return "Kiritilgan ma'lumotlarda xatolik bor"
  return 'So\'rovni bajarib bo\'lmadi'
}

const toApiError = (status: number, data: unknown, forceAuthError = false) => {
  const normalizedStatus = forceAuthError ? AUTH_ERROR_STATUS : status
  const normalizedMessage = forceAuthError
    ? toMessage(AUTH_ERROR_STATUS, null)
    : toMessage(normalizedStatus, data)
  return new ApiError(normalizedMessage, normalizedStatus, data)
}

const toNetworkError = (details?: unknown) => new ApiError("Server bilan aloqa o'rnatilmadi", NETWORK_ERROR_STATUS, details)

/** Shown when API responds with redirect / opaque redirect (session invalid); not the same as wrong password on login. */
const SESSION_EXPIRED_MESSAGE = "Sessiya tugagan yoki tizimga kirish kerak. Iltimos, qayta kiring."

const isHttpRedirectStatus = (status: number) => [301, 302, 303, 307, 308].includes(status)

/** Detects login/session redirects. Uses manual fetch redirects: 3xx stays on the API origin (no follow to e.g. localhost). */
const isAuthRedirectToLogin = (response: Response) => {
  // Cross-origin CORS + redirect:manual yields type "opaqueredirect", status 0; JS cannot read Location.
  if (response.type === 'opaqueredirect') {
    return true
  }
  if (response.redirected) {
    try {
      const parsed = new URL(response.url)
      return parsed.pathname === '/login' || parsed.pathname.endsWith('/login')
    } catch {
      return response.url.includes('/login')
    }
  }
  if (isHttpRedirectStatus(response.status)) {
    const loc = response.headers.get('Location') ?? ''
    if (loc.includes('/login') || /\/login\b/i.test(loc)) return true
    // Backend may redirect to a non-JSON URL (e.g. web login); treat as unauthenticated.
    return true
  }
  return false
}

const createHeaders = (init: RequestInit | undefined, token?: string | null) => {
  const isFormDataBody = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const headers = new Headers(init?.headers)

  // Laravel treats these as API/AJAX requests and returns JSON (401) instead of 302 → web login / SPA URL.
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest')
  }

  if (!isFormDataBody && !headers.has('content-type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

export const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const baseUrl = getApiBaseUrl()
  const token = getStoredAuthToken()

  const fetchWithHeaders = async (headers: Headers) => {
    const { redirect: _ignoredRedirect, ...restInit } = init ?? {}
    const response = await fetch(`${baseUrl}${path}`, {
      ...restInit,
      headers,
      redirect: 'manual',
    })
    const data = await parseResponseData(response)
    return { response, data }
  }

  let response: Response
  let data: unknown
  try {
    const fetched = await fetchWithHeaders(createHeaders(init, token))
    response = fetched.response
    data = fetched.data
  } catch (error) {
    throw toNetworkError(error)
  }

  const redirectedToLogin = isAuthRedirectToLogin(response)

  if (!response.ok || redirectedToLogin) {
    if (redirectedToLogin) {
      throw new ApiError(SESSION_EXPIRED_MESSAGE, AUTH_ERROR_STATUS, data)
    }
    throw toApiError(response.status, data, false)
  }

  return data as T
}

