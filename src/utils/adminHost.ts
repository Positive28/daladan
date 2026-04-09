const parseAdminHosts = (): string[] => {
  const raw = import.meta.env.VITE_ADMIN_APP_HOSTS?.trim()
  if (!raw) return []
  return raw
    .split(',')
    .map((host: string) => host.trim().toLowerCase())
    .filter(Boolean)
}

/** True when the SPA is served on a hostname listed in `VITE_ADMIN_APP_HOSTS` (comma-separated). */
export const isAdminApp = (): boolean => {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return parseAdminHosts().includes(host)
}
