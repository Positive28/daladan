/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../services/apiClient'
import { authService } from '../services'
import type { AuthUser } from '../services/contracts'

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
const AUTH_STORAGE_KEY = 'daladan.auth'

const readStoredToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token?: unknown }
    return typeof parsed.token === 'string' && parsed.token.trim() ? parsed.token : null
  } catch {
    return null
  }
}

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
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => Boolean(readStoredToken()))

  useEffect(() => {
    const token = readStoredToken()
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
        if (!isMounted) return
        setAuthMethod('password')
        setIsAuthLoading(false)
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

  const loginWithPassword = async (phone: string, password: string) => {
    const result = await authService.login({ phone, password })
    setUser(result.user)
    setAuthMethod('password')
    persistSession(result.user, result.token)
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
    setUser(result.user)
    setAuthMethod('password')
    persistSession(result.user, result.token)
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
