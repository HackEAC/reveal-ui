'use client'

import * as React from 'react'
import { ThemeToggle } from '@/components/site/layout/theme-toggle'

const themeStorageKey = 'reveal-ui-docs-theme'
type ThemeMode = 'light' | 'dark'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<ThemeMode>('dark')

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey)
    const prefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedTheme =
      storedTheme === 'dark' || storedTheme === 'light'
        ? storedTheme
        : prefersDark
          ? 'dark'
          : 'light'

    setTheme(resolvedTheme)
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(themeStorageKey, theme)
  }, [mounted, theme])

  return (
    <>
      <ThemeToggle
        mounted={mounted}
        onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        theme={theme}
      />
      {children}
    </>
  )
}
