import { Heart, Moon, Search, Sun, User } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { useTheme } from '../../state/ThemeContext'

export const SiteHeader = () => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [inputValue, setInputValue] = useState(() =>
    location.pathname === '/search' ? new URLSearchParams(location.search).get('q') ?? '' : '',
  )

  useEffect(() => {
    if (location.pathname === '/search') {
      setInputValue(new URLSearchParams(location.search).get('q') ?? '')
    } else {
      setInputValue('')
    }
  }, [location.pathname, location.search])

  const toLogin = () => {
    navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
  }

  const toFavorites = () => {
    if (!user) {
      toLogin()
      return
    }
    navigate('/favorites')
  }

  const commitSearch = (event?: FormEvent) => {
    event?.preventDefault()
    const trimmed = inputValue.trim()
    const next = new URLSearchParams(location.pathname === '/search' ? location.search : '')
    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }
    const searchStr = next.toString()
    navigate({ pathname: '/search', search: searchStr ? `?${searchStr}` : '' })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-daladan-border bg-daladan-surfaceElevated/95 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 lg:px-6">
        <Link to="/" className="shrink-0">
          <img src="/daladan-icon.png" alt="Daladan" className="h-16 w-16 rounded-lg object-contain sm:hidden" />
          <img
            src="/daladan-logo-full-transparent.png"
            alt="Daladan"
            className="hidden h-24 object-contain sm:block"
          />
        </Link>
        <form
          onSubmit={commitSearch}
          className="hidden min-w-0 flex-1 items-center gap-1 rounded-ui border border-daladan-border/80 bg-daladan-soft px-2 py-1.5 md:flex dark:border-slate-600 dark:bg-slate-800"
        >
          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md text-daladan-muted transition-colors hover:bg-daladan-border/40 hover:text-daladan-heading dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Qidiruv"
          >
            <Search size={18} />
          </button>
          <input
            id="site-search"
            name="q"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm text-daladan-heading outline-none dark:text-slate-100"
            placeholder="Yozing, tushib qolmasin — har ikkalamiz qidiramiz"
            autoComplete="off"
          />
        </form>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-daladan-soft text-daladan-muted dark:bg-slate-800 dark:text-slate-300"
          aria-label={theme === 'dark' ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={toFavorites}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-daladan-soft text-daladan-muted dark:bg-slate-800 dark:text-slate-300"
        >
          <Heart size={18} />
        </button>
        {user ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-ui bg-daladan-primary/10 text-daladan-primary"
              aria-label="Profil"
            >
              <User size={18} />
            </button>
            <Link
              to="/profile/ads/new"
              className="rounded-ui bg-daladan-primary px-2.5 py-2 text-center text-sm font-medium text-white sm:px-3"
            >
              reklama ornatish
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={toLogin}
            className="rounded-ui bg-daladan-primary px-4 py-2 text-sm font-medium text-white"
          >
            Kirish
          </button>
        )}
      </div>
    </header>
  )
}
