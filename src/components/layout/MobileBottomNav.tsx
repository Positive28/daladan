import { CirclePlus, Heart, Home, Search, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { LOGIN_PATH, loginReturnState } from '../../utils/appPaths'
import { mobileNavActiveTab, type MobileNavTabId } from './mobileNavActiveTab'

const tabBase =
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors'
const tabInactive = 'text-daladan-muted dark:text-slate-400'
const tabActive = 'text-daladan-primary dark:text-daladan-primary'

function TabLink({
  to,
  tabId,
  activeId,
  icon: Icon,
  label,
}: {
  to: string
  tabId: MobileNavTabId
  activeId: MobileNavTabId | null
  icon: typeof Home
  label: string
}) {
  const active = activeId === tabId
  return (
    <Link
      to={to}
      className={`${tabBase} ${active ? tabActive : tabInactive}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={22} strokeWidth={active ? 2.25 : 2} aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export const MobileBottomNav = () => {
  const location = useLocation()
  const { user } = useAuth()
  const activeId = mobileNavActiveTab(location.pathname)

  const loginOpts = loginReturnState(location)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-daladan-border bg-daladan-surfaceElevated/98 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur dark:border-slate-700 dark:bg-slate-950/98 md:hidden"
      aria-label="Asosiy navigatsiya"
    >
      <div className="mx-auto flex max-w-7xl items-stretch justify-between px-1 pt-1">
        <TabLink to="/" tabId="home" activeId={activeId} icon={Home} label="Bosh" />
        <TabLink to="/search" tabId="search" activeId={activeId} icon={Search} label="Qidiruv" />
        {user ? (
          <TabLink
            to="/profile/ads/new"
            tabId="create"
            activeId={activeId}
            icon={CirclePlus}
            label="E'lon"
          />
        ) : (
          <Link
            to={LOGIN_PATH}
            state={loginOpts.state}
            className={`${tabBase} ${activeId === 'create' ? tabActive : tabInactive}`}
            aria-current={activeId === 'create' ? 'page' : undefined}
          >
            <CirclePlus size={22} strokeWidth={activeId === 'create' ? 2.25 : 2} aria-hidden />
            <span className="truncate">E&apos;lon</span>
          </Link>
        )}
        {user ? (
          <TabLink
            to="/favorites"
            tabId="favorites"
            activeId={activeId}
            icon={Heart}
            label="Sevimli"
          />
        ) : (
          <Link
            to={LOGIN_PATH}
            state={loginOpts.state}
            className={`${tabBase} ${activeId === 'favorites' ? tabActive : tabInactive}`}
          >
            <Heart size={22} strokeWidth={activeId === 'favorites' ? 2.25 : 2} aria-hidden />
            <span className="truncate">Sevimli</span>
          </Link>
        )}
        {user ? (
          <TabLink to="/profile" tabId="profile" activeId={activeId} icon={User} label="Profil" />
        ) : (
          <Link
            to={LOGIN_PATH}
            state={loginOpts.state}
            className={`${tabBase} ${activeId === 'profile' ? tabActive : tabInactive}`}
          >
            <User size={22} strokeWidth={activeId === 'profile' ? 2.25 : 2} aria-hidden />
            <span className="truncate">Profil</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
