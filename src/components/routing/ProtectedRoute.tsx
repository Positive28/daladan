import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { LOGIN_PATH, loginReturnState } from '../../utils/appPaths'

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuthLoading } = useAuth()
  const location = useLocation()

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ebf2f7] text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Yuklanmoqda...
      </div>
    )
  }

  if (!user) {
    const returnState = loginReturnState(location)
    return (
      <Navigate
        to={LOGIN_PATH}
        replace
        state={{
          ...returnState.state,
          backgroundLocation: location,
        }}
      />
    )
  }

  return <>{children}</>
}
