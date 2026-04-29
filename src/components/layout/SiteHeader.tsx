import { ChevronRight, CirclePlus, MapPin, Menu, MessageSquare, Search, User, UserPlus } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { LOGIN_PATH, loginReturnState } from '../../utils/appPaths'

export const SiteHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [inputValue, setInputValue] = useState(() =>
    location.pathname === '/search' ? new URLSearchParams(location.search).get('q') ?? '' : '',
  )
  const [locationInput, setLocationInput] = useState('')

  useEffect(() => {
    if (location.pathname === '/search') {
      setInputValue(new URLSearchParams(location.search).get('q') ?? '')
    } else {
      setInputValue('')
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const toLogin = () => {
    const returnState = loginReturnState(location)
    navigate(LOGIN_PATH, {
      ...returnState,
      state: {
        ...returnState.state,
        backgroundLocation: location,
      },
    })
  }

  const toRegister = () => {
    const returnState = loginReturnState(location)
    navigate('/register', {
      ...returnState,
      state: {
        ...returnState.state,
        backgroundLocation: location,
      },
    })
  }

  const toFavorites = () => {
    if (!user) {
      toLogin()
      return
    }
    navigate('/favorites')
  }

  const toProfileTab = (tab: 'profile' | 'messages' | 'ads' | 'payments') => {
    navigate('/profile', { state: { tab } })
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
    navigate('/', { replace: true })
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
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 py-1 pl-2 pr-0.5 lg:pl-4 lg:pr-1">

        <Link to="/" className="-my-3 -ml-12 mr-3 shrink-0 lg:-ml-10 lg:mr-5">
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

        <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex lg:px-4">
          <form
            onSubmit={commitSearch}
            className="flex h-12 w-full max-w-[840px] min-w-0 items-stretch overflow-hidden rounded-xl border border-[#0f4f69] bg-white"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-l-xl border border-slate-300 bg-white px-3 transition-all focus-within:ring-1 focus-within:ring-daladan-primary/45">
              <Search size={19} className="shrink-0 text-slate-500" />
              <input
                id="site-search"
                name="q"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[15px] text-slate-800 placeholder:font-medium placeholder:tracking-[0.01em] placeholder:text-slate-400 placeholder:transition-all focus:placeholder:text-slate-300 focus:outline-none"
                placeholder="Daladan izlang..."
                autoComplete="off"
              />
            </div>
            <div className="flex min-w-0 w-[260px] items-center gap-2 border border-slate-300 bg-white px-3 transition-all focus-within:ring-1 focus-within:ring-daladan-primary/45">
              <MapPin size={19} className="shrink-0 text-slate-500" />
              <input
                name="location"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[15px] text-slate-800 placeholder:font-medium placeholder:tracking-[0.01em] placeholder:text-slate-400 placeholder:transition-all focus:placeholder:text-slate-300 focus:outline-none"
                placeholder="Joylashuv kiriting"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-full w-12 shrink-0 self-stretch items-center justify-center rounded-r-xl bg-daladan-primary text-white transition-colors hover:bg-daladan-primary/90"
              aria-label="Qidiruv"
            >
              <Search size={19} />
            </button>
          </form>
        </div>

        <div className="-ml-3 mr-[-8px] flex shrink-0 items-center gap-0 lg:-ml-2 lg:mr-[-10px]">
          {/* Theme toggle hidden temporarily; spacer preserves header alignment */}
          <div className="-ml-4 h-[42px] w-[44px] lg:-ml-2" aria-hidden="true" />

          {user ? (
            <>
              <Link
                to="/profile/ads/new"
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <CirclePlus size={24} />
                <span className="hidden text-xs font-medium leading-none lg:block">E'lon</span>
              </Link>
              <button
                type="button"
                onClick={() => navigate('/profile', { state: { tab: 'messages' } })}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Xabarlar"
              >
                <MessageSquare size={24} />
                <span className="hidden text-xs font-medium leading-none lg:block">Xabarlar</span>
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                  aria-label="Menyu"
                  aria-expanded={isMenuOpen}
                >
                  <Menu size={24} />
                  <span className="hidden text-xs font-medium leading-none lg:block">Menyu</span>
                </button>

                {isMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-64 overflow-hidden rounded-lg border border-slate-600 bg-slate-700 py-1.5 text-white shadow-2xl">
                    <button
                      type="button"
                      onClick={() => toProfileTab('profile')}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Mening profilim
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toProfileTab('ads')}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      E&apos;lonlarim
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toProfileTab('messages')}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Xabarlar
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toFavorites()
                        setIsMenuOpen(false)
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Sevimlilar
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleLogout()
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Chiqish
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="ml-4 flex items-center gap-0 lg:ml-5">
              <button
                type="button"
                onClick={toLogin}
                className="group flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-300 transition-colors"
              >
                <CirclePlus size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  E'lon
                </span>
              </button>
              <button
                type="button"
                onClick={toRegister}
                className="group flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-300 transition-colors"
              >
                <UserPlus size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  Ro'yxat
                </span>
              </button>
              <button
                type="button"
                onClick={toLogin}
                className="group flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-300 transition-colors"
              >
                <User size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  Kirish
                </span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
