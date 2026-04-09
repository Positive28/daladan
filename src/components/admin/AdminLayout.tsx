import { useState, type ReactNode } from 'react'
import { LayoutDashboard, LogOut, Menu, Moon, Sun, Tags, Users, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { useTheme } from '../../state/ThemeContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-daladan-primary text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ')

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  const sidebar = (
    <>
      <div className="border-b border-slate-200 px-4 py-5 dark:border-slate-700">
        <NavLink to="/" className="flex items-center gap-2" onClick={closeMobile}>
          <img src="/daladan-logo-full-transparent.png" alt="Daladan" className="h-9 object-contain" />
        </NavLink>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Admin panel
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        <NavLink to="/" end className={navClass} onClick={closeMobile}>
          <LayoutDashboard size={18} aria-hidden />
          Boshqaruv
        </NavLink>
        <NavLink to="/categories" className={navClass} onClick={closeMobile}>
          <Tags size={18} aria-hidden />
          Kategoriyalar
        </NavLink>
        <NavLink to="/subcategories" className={navClass} onClick={closeMobile}>
          <Tags size={18} aria-hidden />
          Subkategoriyalar
        </NavLink>
        <NavLink to="/users" className={navClass} onClick={closeMobile}>
          <Users size={18} aria-hidden />
          Foydalanuvchilar
        </NavLink>
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
          {sidebar}
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/50 dark:bg-black/60"
              aria-label="Menyuni yopish"
              onClick={closeMobile}
            />
            <div className="absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-slate-900">
              <div className="flex items-center justify-end border-b border-slate-200 p-2 dark:border-slate-700">
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-lg p-2 text-slate-600 dark:text-slate-300"
                  aria-label="Yopish"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{sidebar}</div>
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                onClick={() => setMobileOpen(true)}
                aria-label="Menyuni ochish"
              >
                <Menu size={20} />
              </button>
              <span className="truncate text-sm text-slate-600 dark:text-slate-400">
                {user?.fullName ? (
                  <>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{user.fullName}</span>
                    {user.phone ? <span className="text-slate-500"> · {user.phone}</span> : null}
                  </>
                ) : (
                  'Admin'
                )}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                aria-label={theme === 'dark' ? "Yorug' rejim" : "Qorong'i rejim"}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <LogOut size={16} aria-hidden />
                Chiqish
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children ?? <Outlet />}</main>
        </div>
      </div>
    </div>
  )
}
