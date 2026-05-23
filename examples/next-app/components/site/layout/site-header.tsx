'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RevealLogoMark } from '@/components/site/logo-mark'
import { Button } from '@/components/ui/button'
import { primaryNav } from '@/lib/navigation'
import { siteConfig } from '@/lib/site'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="page-shell flex h-14 items-center justify-between gap-4">
        <Link className="flex items-center gap-2.5" href="/">
          <RevealLogoMark className="size-8 shrink-0" />
          <span className="font-semibold tracking-[-0.02em] text-foreground">reveal-ui</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex" size="sm" variant="ghost">
            <Link href="/docs">Docs</Link>
          </Button>
          <Button asChild size="sm">
            <a href={siteConfig.repoUrl} rel="noreferrer" target="_blank">
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
