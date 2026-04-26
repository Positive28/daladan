import { Heart, LogIn, Moon, Search, Sun, User, UserPlus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { useTheme } from '../../state/ThemeContext'
import { LOGIN_PATH, loginReturnState } from '../../utils/appPaths'

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
    navigate(LOGIN_PATH, loginReturnState(location))
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
    <header className="sticky top-0 z-20 bg-slate-800 shadow-xl dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-1.5 lg:px-6">

        <Link to="/" className="-my-3 shrink-0">
          <img
            src="/daladan-icon.png"
            alt="Daladan"
            className="h-16 w-16 rounded-lg object-contain sm:hidden"
          />
          <img
            src="/daladan-logo-full-transparent.png"
            alt="Daladan"
            className="hidden h-20 object-contain sm:block"
          />
        </Link>

        <form
          onSubmit={commitSearch}
          className="hidden min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-600 bg-slate-700 transition-all focus-within:border-daladan-primary/60 focus-within:bg-slate-700 focus-within:ring-2 focus-within:ring-daladan-primary/30 md:flex"
        >
          <Search
            size={18}
            className="ml-4 shrink-0 self-center text-slate-400"
          />
          <input
            id="site-search"
            name="q"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none"
            placeholder="Daladan izlang..."
            autoComplete="off"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 bg-daladan-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-daladan-primary/90"
            aria-label="Qidiruv"
          >
            <Search size={17} />
            <span className="hidden lg:inline">Qidirish</span>
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label={theme === 'dark' ? "Yorug' rejim" : "Qorong'i rejim"}
          >
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            <span className="hidden text-[10px] font-medium leading-none lg:block">
              {theme === 'dark' ? "Yorug'" : "Qorong'i"}
            </span>
          </button>

          <button
            type="button"
            onClick={toFavorites}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label="Sevimlilar"
          >
            <Heart size={22} />
            <span className="hidden text-[10px] font-medium leading-none lg:block">Sevimlilar</span>
          </button>

          {user ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Profil"
              >
                <User size={22} />
                <span className="hidden text-[10px] font-medium leading-none lg:block">Profil</span>
              </button>
              <Link
                to="/profile/ads/new"
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-daladan-primary transition-colors hover:bg-slate-700"
              >
                <LogIn size={22} />
                <span className="hidden text-[10px] font-medium leading-none lg:block">E'lon</span>
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <UserPlus size={22} />
                <span className="hidden text-[10px] font-medium leading-none lg:block">Ro'yxat</span>
              </button>
              <button
                type="button"
                onClick={toLogin}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <User size={22} />
                <span className="hidden text-[10px] font-medium leading-none lg:block">Kirish</span>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
