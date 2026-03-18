import { Heart, Moon, Search, Sun, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { useTheme } from '../../state/ThemeContext'

export const SiteHeader = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentQuery = new URLSearchParams(location.search).get('q') ?? ''

  const toLogin = () => {
    navigate('/login', { state: { from: location.pathname } })
  }

  const toFavorites = () => {
    if (!user) {
      toLogin()
      return
    }
    navigate('/favorites')
  }

  const updateSearch = (query: string) => {
    const trimmed = query.trim()
    navigate(
      {
        pathname: '/',
        search: trimmed ? `?q=${encodeURIComponent(trimmed)}` : '',
      },
      { replace: true },
    )
  }

  const onLogout = async () => {
    const confirmed = window.confirm('Hisobdan chiqmoqchimisiz?')
    if (!confirmed) return

    setIsLoggingOut(true)
    try {
      // Leave protected routes first to avoid redirecting to /login after user state is cleared.
      navigate('/', { replace: true })
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 lg:px-6">
        <Link to="/" className="shrink-0">
          <img src="/daladan-icon.png" alt="Daladan" className="h-16 w-16 rounded-lg object-contain sm:hidden" />
          <img
            src="/daladan-logo-full-transparent.png"
            alt="Daladan"
            className="hidden h-24 object-contain sm:block"
          />
        </Link>
        <label className="hidden flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 md:flex dark:bg-slate-800">
          <Search size={16} className="text-slate-400 dark:text-slate-500" />
          <input
            value={currentQuery}
            onChange={(event) => updateSearch(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
            placeholder="Mahsulot qidirish..."
          />
        </label>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          aria-label={theme === 'dark' ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={toFavorites}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          <Heart size={18} />
        </button>
        {user ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-daladan-primary/10 text-daladan-primary"
            >
              <User size={18} />
            </button>
            <button
              type="button"
              onClick={() => void onLogout()}
              disabled={isLoggingOut}
              className="rounded-xl bg-daladan-primary px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toLogin}
            className="rounded-xl bg-daladan-primary px-4 py-2 text-sm font-medium text-white"
          >
            Kirish
          </button>
        )}
      </div>
    </header>
  )
}
