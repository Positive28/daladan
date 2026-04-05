/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError, AUTH_STORAGE_KEY, getStoredAuthToken } from '../services/apiClient'
import { authService } from '../services'
import type { AuthResult, AuthUser } from '../services/contracts'

interface RegisterPayload {
  fname: string
  lname: string
  phone: string
  password: string
  regionId: number
  cityId: number
  email?: string
  telegram?: string
}

type AuthMethod = 'password' | 'otp'

interface AuthContextValue {
  user: AuthUser | null
  isAuthLoading: boolean
  authMethod: AuthMethod
  loginWithPassword: (phone: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
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

  useEffect(() => {
    const token = getStoredAuthToken()
    if (!token) {
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
          setUser(null)
          localStorage.removeItem(AUTH_STORAGE_KEY)
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
  }, [])

  const persistSession = (nextUser: AuthUser, token?: string) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token }))
  }

  const syncUserAfterAuth = async (result: AuthResult) => {
    let nextUser = result.user
    if (result.token) {
      // Persist token first so profile/me request uses latest credentials.
      persistSession(nextUser, result.token)
      try {
        nextUser = await authService.getMe()
      } catch {
        // Keep login/register payload user when profile fetch fails.
      }
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
      },
      'password',
    )
    setAuthMethod('password')
    await syncUserAfterAuth(result)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Clear local session regardless of backend logout response.
    }
    setUser(null)
    setAuthMethod('password')
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, authMethod, loginWithPassword, register, logout }}>
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
