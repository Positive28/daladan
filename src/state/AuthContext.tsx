/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError, AUTH_STORAGE_KEY, getStoredAuthToken } from '../services/apiClient'
import { authService } from '../services'
import type { AuthResult, AuthUser } from '../services/contracts'

interface RegisterPayload {
  phone?: string
  email?: string
  password: string
  fname?: string
  lname?: string
  regionId?: number
  cityId?: number
  telegram?: string
}

type AuthMethod = 'password' | 'otp'

interface AuthContextValue {
  user: AuthUser | null
  isAuthLoading: boolean
  authMethod: AuthMethod
  loginWithPassword: (phone: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  /** Persists new token + user after `authService.refresh()` (see `features/session-refresh`). */
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!getStoredAuthToken()) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch {
        // Ignore storage cleanup issues.
      }
      return null
    }

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { user?: AuthUser }
      return parsed.user ?? null
    } catch {
      return null
    }
  })
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => Boolean(getStoredAuthToken()))

  const clearSession = useCallback(() => {
    setUser(null)
    setAuthMethod('password')
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // Ignore storage cleanup issues.
    }
  }, [])

  useEffect(() => {
    const token = getStoredAuthToken()
    if (!token) {
      clearSession()
      setIsAuthLoading(false)
      return
    }

    let isMounted = true

    const syncUser = async () => {
      try {
        const me = await authService.getMe()
        if (!isMounted) return
        setUser(me)
      } catch (error) {
        if (!isMounted) return
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession()
        }
      } finally {
        if (isMounted) {
          setAuthMethod('password')
          setIsAuthLoading(false)
        }
      }
    }

    void syncUser()
    return () => {
      isMounted = false
    }
  }, [clearSession])

  const persistSession = (nextUser: AuthUser, token: string) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token }))
  }

  const syncUserAfterAuth = async (result: AuthResult) => {
    if (!result.token) {
      clearSession()
      throw new Error('Autentifikatsiya tokeni topilmadi')
    }

    let nextUser = result.user
    // Persist token first so profile/me request uses latest credentials.
    persistSession(nextUser, result.token)
    try {
      nextUser = await authService.getMe()
    } catch {
      // Keep login/register payload user when profile fetch fails.
    }

    setUser(nextUser)
    persistSession(nextUser, result.token)
  }

  const loginWithPassword = async (phone: string, password: string) => {
    const result = await authService.login({ phone, password })
    setAuthMethod('password')
    await syncUserAfterAuth(result)
  }

  const register = async (payload: RegisterPayload) => {
    const result = await authService.register(
      {
        phone: payload.phone,
        password: payload.password,
        fname: payload.fname,
        lname: payload.lname,
        region_id: payload.regionId,
        city_id: payload.cityId,
        email: payload.email,
        telegram: payload.telegram,
      } as Parameters<typeof authService.register>[0],
      'password',
    )
    setAuthMethod('password')
    await syncUserAfterAuth(result)
  }

  const refreshSession = async () => {
    const result = await authService.refresh()
    setAuthMethod('password')
    await syncUserAfterAuth(result)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Clear local session regardless of backend logout response.
    }
    clearSession()
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthLoading, authMethod, loginWithPassword, register, refreshSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
