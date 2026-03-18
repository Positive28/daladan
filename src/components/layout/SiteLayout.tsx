import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export const SiteLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="min-h-screen bg-daladan-soft dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        {children ?? <Outlet />}
      </main>
      <SiteFooter />
    </div>
  )
}
