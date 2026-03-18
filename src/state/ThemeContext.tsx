/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'daladan.theme'
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const getInitialTheme = (): ThemeMode => {
  let resolvedTheme: ThemeMode = 'light'
  let source: 'storage' | 'system' | 'default' = 'default'

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      resolvedTheme = stored
      source = 'storage'
    }
  } catch {
    // Ignore localStorage access issues and fall back to system preference.
  }

  if (source !== 'storage' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    resolvedTheme = 'dark'
    source = 'system'
  }

  return resolvedTheme
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const appRoot = document.getElementById('root')

    // Ensure no stale "dark" classes remain on non-root nodes.
    root.classList.remove('dark')
    body.classList.remove('dark')
    appRoot?.classList.remove('dark')

    // Tailwind class-based dark mode should be driven by html only.
    if (theme === 'dark') {
      root.classList.add('dark')
    }

    root.dataset.theme = theme
    root.style.colorScheme = theme
    body.style.colorScheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return ctx
}

