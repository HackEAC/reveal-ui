'use client'

import { Moon, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ThemeMode = 'light' | 'dark'

export function ThemeToggle({
  mounted,
  onToggle,
  theme,
}: {
  mounted: boolean
  onToggle: () => void
  theme: ThemeMode
}) {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Button
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        className="size-10 rounded-full shadow-lg"
        onClick={onToggle}
        size="icon"
        variant="outline"
      >
        {mounted && theme === 'dark' ? (
          <SunMedium className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </Button>
    </div>
  )
}
