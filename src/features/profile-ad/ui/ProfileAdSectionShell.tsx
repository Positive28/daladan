import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ProfileAdSectionShellProps = {
  title: ReactNode
  subtitle: ReactNode
  children: ReactNode
  /** Defaults to `/profile`. */
  backTo?: string
  trailing?: ReactNode
}

export function ProfileAdSectionShell({
  backTo = '/profile',
  title,
  subtitle,
  trailing,
  children,
}: ProfileAdSectionShellProps) {
  return (
    <section className="space-y-5 rounded-ui border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={backTo}
            className="text-sm font-medium text-daladan-primary hover:underline"
          >
            ← Profilga qaytish
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
        {trailing}
      </div>
      {children}
    </section>
  )
}
