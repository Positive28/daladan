import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { MobileBottomNav } from './MobileBottomNav'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export const SiteLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="min-h-screen bg-daladan-soft dark:bg-slate-950">
      <div className="hidden md:block">
        <SiteHeader />
      </div>
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-6 lg:px-6">
        {children ?? <Outlet />}
      </main>
      <div className="hidden md:block">
        <SiteFooter />
      </div>
      <MobileBottomNav />
    </div>
  )
}
