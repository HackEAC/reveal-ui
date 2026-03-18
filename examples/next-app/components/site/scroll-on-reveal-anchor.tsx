'use client'

import * as React from 'react'

type RevealPhaseLike = 'closed' | 'opening' | 'open' | 'closing'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mediaQuery.matches)

    update()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update)
      return () => mediaQuery.removeEventListener('change', update)
    }

    mediaQuery.addListener(update)
    return () => mediaQuery.removeListener(update)
  }, [])

  return prefersReducedMotion
}

export function ScrollOnRevealAnchor({
  offset,
  phase,
  restoreOnClose = false,
}: {
  offset: number
  phase: RevealPhaseLike
  restoreOnClose?: boolean
}) {
  const anchorRef = React.useRef<HTMLDivElement | null>(null)
  const hasScrolledRef = React.useRef(false)
  const restoreScrollTopRef = React.useRef<number | null>(null)
  const didAutoScrollRef = React.useRef(false)
  const restoreStartedRef = React.useRef(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  React.useEffect(() => {
    if (phase !== 'opening' || hasScrolledRef.current) {
      return
    }

    const anchor = anchorRef.current
    if (!anchor || typeof window === 'undefined') {
      return
    }

    if (restoreOnClose) {
      restoreScrollTopRef.current = window.scrollY
      didAutoScrollRef.current = false
      restoreStartedRef.current = false
    }

    hasScrolledRef.current = true

    let firstFrame = 0
    let secondFrame = 0

    const scrollToAnchor = () => {
      const top = window.scrollY + anchor.getBoundingClientRect().top - offset
      const nextTop = Math.max(0, top)

      if (restoreOnClose && Math.abs(window.scrollY - nextTop) > 2) {
        didAutoScrollRef.current = true
      }

      window.scrollTo({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        left: 0,
        top: nextTop,
      })
    }

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(scrollToAnchor)
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [offset, phase, prefersReducedMotion, restoreOnClose])

  React.useEffect(() => {
    if (phase === 'opening' || phase === 'open') {
      restoreStartedRef.current = false
      return
    }

    if (phase !== 'closing' && phase !== 'closed') return
    if (restoreStartedRef.current) return

    hasScrolledRef.current = false

    const restoreTop = restoreScrollTopRef.current
    restoreStartedRef.current = true
    restoreScrollTopRef.current = null

    if (!restoreOnClose || restoreTop === null || !didAutoScrollRef.current) {
      didAutoScrollRef.current = false
      return
    }

    didAutoScrollRef.current = false

    let cancelled = false
    let frame = 0
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    const settleRestore = () => {
      const startedAt = performance.now()
      let stableFrames = 0

      const tick = () => {
        if (cancelled) return

        window.scrollTo({ left: 0, top: restoreTop })
        if (Math.abs(window.scrollY - restoreTop) <= 2) {
          stableFrames += 1
        } else {
          stableFrames = 0
        }

        if (stableFrames >= 2) return
        if (performance.now() - startedAt >= 700) return
        frame = window.requestAnimationFrame(tick)
      }

      frame = window.requestAnimationFrame(tick)
    }

    const restore = () => {
      if (cancelled) return

      window.scrollTo({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        left: 0,
        top: restoreTop,
      })

      settleTimer = setTimeout(
        () => {
          if (cancelled) return
          settleRestore()
        },
        prefersReducedMotion ? 0 : 520,
      )
    }

    frame = window.requestAnimationFrame(restore)

    return () => {
      cancelled = true
      if (settleTimer) clearTimeout(settleTimer)
      window.cancelAnimationFrame(frame)
    }
  }, [phase, prefersReducedMotion, restoreOnClose])

  return <div aria-hidden="true" className="h-px w-full" ref={anchorRef} />
}
