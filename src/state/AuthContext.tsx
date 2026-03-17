/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

interface RegisterPayload {
  fullName: string
  phone: string
  region: string
  password?: string
  authMethod: AuthMethod
}

type AuthMethod = 'password' | 'otp'

interface AuthUser {
  fullName: string
  phone: string
  region: string
  authMethod: AuthMethod
}

interface AuthContextValue {
  user: AuthUser | null
  pendingOtpPhone: string | null
  loginWithPassword: (phone: string) => boolean
  requestOtp: (phone: string) => void
  loginWithOtp: (code: string) => boolean
  register: (payload: RegisterPayload) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [pendingOtpPhone, setPendingOtpPhone] = useState<string | null>(null)
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, RegisterPayload>>({})

  const loginWithPassword = (phone: string) => {
    const found = registeredUsers[phone]
    setUser({
      fullName: found?.fullName ?? 'Mehmon foydalanuvchi',
      phone: phone || found?.phone || '+998 00 000 00 00',
      region: found?.region ?? 'Uzbekistan',
      authMethod: 'password',
    })
    return true
  }

  const requestOtp = (phone: string) => {
    setPendingOtpPhone(phone)
  }

  const loginWithOtp = (code: string) => {
    if (!pendingOtpPhone || code !== '1234') return false
    const found = registeredUsers[pendingOtpPhone]
    setUser({
      fullName: found?.fullName ?? 'Mehmon foydalanuvchi',
      phone: pendingOtpPhone,
      region: found?.region ?? 'Uzbekistan',
      authMethod: 'otp',
    })
    setPendingOtpPhone(null)
    return true
  }

  const register = (payload: RegisterPayload) => {
    setRegisteredUsers((prev) => ({
      ...prev,
      [payload.phone]: payload,
    }))
    setUser({
      fullName: payload.fullName,
      phone: payload.phone,
      region: payload.region,
      authMethod: payload.authMethod,
    })
  }

  const logout = () => {
    setUser(null)
    setPendingOtpPhone(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingOtpPhone,
        loginWithPassword,
        requestOtp,
        loginWithOtp,
        register,
        logout,
      }}
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
