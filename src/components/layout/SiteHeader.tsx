import { Heart, Search, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'

export const SiteHeader = () => {
  const { user, logout } = useAuth()
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

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 lg:px-6">
        <Link to="/" className="shrink-0">
          <img src="/daladan-icon.png" alt="Daladan" className="h-10 w-10 rounded-lg object-contain sm:hidden" />
          <img src="/daladan-logo-full.png" alt="Daladan" className="hidden h-12 object-contain sm:block" />
        </Link>
        <label className="hidden flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 md:flex">
          <Search size={16} className="text-slate-400" />
          <input
            value={currentQuery}
            onChange={(event) => updateSearch(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Mahsulot qidirish..."
          />
        </label>
        <button
          type="button"
          onClick={toFavorites}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
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
              onClick={logout}
              className="rounded-xl bg-daladan-primary px-3 py-2 text-sm text-white"
            >
              Chiqish
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
