/* biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: motion and nested scroll coordination intentionally stay co-located in the public primitive. */
'use client'

import { Slot } from '@radix-ui/react-slot'
import { type ClassValue, clsx } from 'clsx'
import { LayoutGroup, motion, type Transition } from 'motion/react'
import * as React from 'react'
import { twMerge } from 'tailwind-merge'

declare const process:
  | {
      env?: {
        NODE_ENV?: string
      }
    }
  | undefined

const isDevelopment = process?.env?.NODE_ENV !== 'production'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CloseOptions = {
  propagate?: boolean
  restoreFocus?: boolean
}

export type RevealPhase = 'closed' | 'opening' | 'open' | 'closing'

export type RevealRenderProps = {
  close: (arg?: CloseOptions) => void
  open: () => void
  isOpen: boolean
  phase: RevealPhase
  contentId: string
  triggerId?: string
}

export type RevealContentProp = React.ReactNode | ((props: RevealRenderProps) => React.ReactNode)

export interface RevealPanelProps {
  children: React.ReactNode
  content?: RevealContentProp
  /** @deprecated Use `content` instead. */
  revealContent?: RevealContentProp
  className?: string
  keepMounted?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  triggerAttr?: string
  restoreAttr?: string
  autoSplit?: boolean
  closeSiblings?: boolean
  containTriggers?: boolean
  scrollOnOpen?: boolean
  restoreScrollOnClose?: boolean
  scrollContainer?: HTMLElement | null | (() => HTMLElement | null)
  scrollCascade?: Array<{
    container: HTMLElement | null | (() => HTMLElement | null)
    offset?: number
    mode?: 'ensure-visible' | 'align-top'
    padding?: number
  }>
  scrollOffset?: number
  scrollDurationMs?: number
  magicMotion?: boolean
  parallaxOffset?: number
  revealBlurPx?: number
  scrollOvershootPx?: number
  scrollSpacerTarget?: 'self' | 'container' | 'none'
  restoreFocusOnClose?: boolean
  regionLabel?: string
}

type ResolvedPrimaryScrollTarget = { kind: 'window' } | { kind: 'element'; element: HTMLElement }

type ScrollRestoreSnapshot =
  | { kind: 'window'; top: number; didAutoScroll: boolean }
  | { kind: 'element'; element: HTMLElement; top: number; didAutoScroll: boolean }

type RevealGroupContextValue = {
  register: (id: string, close: (arg?: CloseOptions) => void) => () => void
  closeOthers: (id: string) => void
  closeSiblingsDefault: boolean
}

type RevealHierarchyContextValue = {
  close: (arg?: CloseOptions) => void
}

export type RevealPanelState = {
  isOpen: boolean
  phase: RevealPhase
  disabled: boolean
  contentId: string
  triggerId?: string
  open: () => void
  close: (arg?: CloseOptions) => void
}

type RevealItemContextValue = RevealPanelState & {
  setLastTrigger: (node: HTMLElement | null) => void
  setExplicitTriggerId: (id: string) => void
}

const RevealGroupContext = React.createContext<RevealGroupContextValue | null>(null)
const RevealHierarchyContext = React.createContext<RevealHierarchyContextValue | null>(null)
const RevealItemContext = React.createContext<RevealItemContextValue | null>(null)

export function useRevealPanelState(): RevealPanelState {
  const context = React.useContext(RevealItemContext)

  if (!context) {
    throw new Error('useRevealPanelState must be used inside a RevealPanel.')
  }

  const { close, contentId, disabled, isOpen, open, phase, triggerId } = context

  return { close, contentId, disabled, isOpen, open, phase, triggerId }
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ref.current = value
}

function useControllableState({
  value,
  defaultValue,
  onChange,
}: {
  value: boolean | undefined
  defaultValue: boolean
  onChange?: (nextValue: boolean) => void
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : uncontrolledValue

  const setValue = React.useCallback(
    (nextValue: boolean) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }
      onChange?.(nextValue)
    },
    [isControlled, onChange],
  )

  return [resolvedValue, setValue] as const
}

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

function isNaturallyInteractive(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase()
  if (tagName === 'button') return true
  if (tagName === 'summary') return true
  if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') return true
  if (tagName === 'a') return element.hasAttribute('href')
  return element.getAttribute('contenteditable') === 'true'
}

function isFocusable(element: HTMLElement) {
  if (element.tabIndex >= 0) return true
  return isNaturallyInteractive(element)
}

function callHandler<E extends React.SyntheticEvent | Event>(
  handler: ((event: E) => void) | undefined,
  event: E,
) {
  handler?.(event)
}

function activateWithKeyboard(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' '
}

const Top = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-split-top className={className}>
    {children}
  </div>
)

const Bottom = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-split-bottom className={className}>
    {children}
  </div>
)

export function RevealGroup({
  children,
  closeSiblings = true,
}: {
  children: React.ReactNode
  closeSiblings?: boolean
}) {
  const registryRef = React.useRef(new Map<string, (arg?: CloseOptions) => void>())

  const register = React.useCallback((id: string, close: (arg?: CloseOptions) => void) => {
    registryRef.current.set(id, close)
    return () => registryRef.current.delete(id)
  }, [])

  const closeOthers = React.useCallback((id: string) => {
    for (const [key, close] of registryRef.current.entries()) {
      if (key !== id) {
        close({ restoreFocus: false })
      }
    }
  }, [])

  return (
    <RevealGroupContext.Provider
      value={{ register, closeOthers, closeSiblingsDefault: closeSiblings }}
    >
      {children}
    </RevealGroupContext.Provider>
  )
}

export interface RevealTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean
}

export const RevealTrigger = React.forwardRef<HTMLButtonElement, RevealTriggerProps>(
  function RevealTrigger({ asChild = false, onClick, disabled, type, ...props }, forwardedRef) {
    const context = React.useContext(RevealItemContext)

    if (!context) {
      throw new Error('RevealTrigger must be used inside a RevealPanel.')
    }

    const generatedId = React.useId()
    const { isOpen, phase, contentId, setLastTrigger, setExplicitTriggerId, open } = context
    const resolvedId = props.id ?? generatedId
    const Component = asChild ? Slot : 'button'
    const isDisabled = disabled ?? context.disabled

    return (
      <Component
        {...props}
        ref={forwardedRef as React.Ref<HTMLButtonElement>}
        id={resolvedId}
        type={!asChild ? (type ?? 'button') : undefined}
        data-trigger-collapse
        data-disabled={isDisabled ? '' : undefined}
        data-state={isOpen ? 'open' : 'closed'}
        data-phase={phase}
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={!asChild ? isDisabled : undefined}
        aria-disabled={asChild && isDisabled ? true : undefined}
        onClick={(event) => {
          callHandler(onClick, event as React.MouseEvent<HTMLButtonElement>)
          if (event.defaultPrevented || isDisabled) {
            return
          }
          setLastTrigger(event.currentTarget)
          setExplicitTriggerId(resolvedId)
          open()
        }}
      />
    )
  },
)

export const RevealClose = React.forwardRef<HTMLButtonElement, RevealTriggerProps>(
  function RevealClose({ asChild = false, onClick, disabled, type, ...props }, forwardedRef) {
    const context = React.useContext(RevealItemContext)

    if (!context) {
      throw new Error('RevealClose must be used inside a RevealPanel.')
    }

    const Component = asChild ? Slot : 'button'
    const isDisabled = disabled ?? context.disabled

    return (
      <Component
        {...props}
        ref={forwardedRef as React.Ref<HTMLButtonElement>}
        type={!asChild ? (type ?? 'button') : undefined}
        data-trigger-restore
        data-disabled={isDisabled ? '' : undefined}
        data-state={context.isOpen ? 'open' : 'closed'}
        data-phase={context.phase}
        aria-controls={context.contentId}
        disabled={!asChild ? isDisabled : undefined}
        aria-disabled={asChild && isDisabled ? true : undefined}
        onClick={(event) => {
          callHandler(onClick, event as React.MouseEvent<HTMLButtonElement>)
          if (event.defaultPrevented || isDisabled) {
            return
          }
          context.close()
        }}
      />
    )
  },
)

type RevealPanelComponent = React.ForwardRefExoticComponent<
  RevealPanelProps & React.RefAttributes<HTMLDivElement>
> & {
  Bottom: typeof Bottom
  Close: typeof RevealClose
  Top: typeof Top
  Trigger: typeof RevealTrigger
}

const RevealPanelBase = React.forwardRef<HTMLDivElement, RevealPanelProps>(function RevealPanel(
  {
    children,
    content,
    revealContent,
    className,
    keepMounted = false,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    disabled = false,
    triggerAttr = 'data-trigger-collapse',
    restoreAttr = 'data-trigger-restore',
    autoSplit = false,
    closeSiblings,
    containTriggers = true,
    scrollOnOpen = false,
    restoreScrollOnClose = false,
    scrollContainer,
    scrollCascade,
    scrollOffset = 0,
    scrollDurationMs = 450,
    magicMotion = false,
    parallaxOffset = 10,
    revealBlurPx = 6,
    scrollOvershootPx = 12,
    scrollSpacerTarget = 'self',
    restoreFocusOnClose = true,
    regionLabel = 'Revealed content',
  },
  forwardedRef,
) {
  const resolvedContent = content ?? revealContent
  const hasResolvedContent =
    resolvedContent !== null && resolvedContent !== undefined && resolvedContent !== false
  const [isOpen, setOpenState] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [phase, setPhase] = React.useState<RevealPhase>(() =>
    (controlledOpen ?? defaultOpen) ? 'open' : 'closed',
  )
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasAutoScrolledThisOpenRef = React.useRef(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const lastTriggerRef = React.useRef<HTMLElement | null>(null)
  const phaseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousOpenRef = React.useRef(isOpen)
  const restoreScrollSnapshotRef = React.useRef<ScrollRestoreSnapshot | null>(null)
  const restoreScrollStartedRef = React.useRef(false)
  const [extraScrollSpace, setExtraScrollSpace] = React.useState(0)
  const extraScrollSpaceRef = React.useRef(0)
  const containerPaddingRef = React.useRef<{ el: HTMLElement; paddingBottom: string } | null>(null)
  const [delegatedTriggerId, setDelegatedTriggerId] = React.useState<string>()
  const [explicitTriggerId, setExplicitTriggerIdState] = React.useState<string>()
  const instanceId = React.useId()
  const contentId = `${instanceId}-content`
  const group = React.useContext(RevealGroupContext)
  const parentHierarchy = React.useContext(RevealHierarchyContext)
  const shouldCloseSiblings = closeSiblings ?? group?.closeSiblingsDefault ?? false

  if (!hasResolvedContent && isDevelopment) {
    console.warn('RevealPanel requires either a content or revealContent prop.')
  }

  const setContainerNode = React.useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node
      setRef(forwardedRef, node)
    },
    [forwardedRef],
  )

  const restoreFocusToTrigger = React.useCallback(() => {
    const target = lastTriggerRef.current
    if (!target || !target.isConnected) return

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        if (target.isConnected) {
          target.focus({ preventScroll: true })
        }
      })
      return
    }

    target.focus()
  }, [])

  const setLastTrigger = React.useCallback((node: HTMLElement | null) => {
    if (node) {
      lastTriggerRef.current = node
    }
  }, [])

  const setExplicitTriggerId = React.useCallback((id: string) => {
    setExplicitTriggerIdState(id)
  }, [])

  const clearPhaseTimer = React.useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current)
      phaseTimerRef.current = null
    }
  }, [])

  const open = React.useCallback(() => {
    if (disabled) return
    if (shouldCloseSiblings && group) {
      group.closeOthers(instanceId)
    }
    setOpenState(true)
  }, [disabled, group, instanceId, setOpenState, shouldCloseSiblings])

  const close = React.useCallback(
    (arg?: CloseOptions) => {
      setOpenState(false)
      if ((arg?.restoreFocus ?? restoreFocusOnClose) && !arg?.propagate) {
        restoreFocusToTrigger()
      }
      if (arg?.propagate) {
        parentHierarchy?.close({ propagate: true, restoreFocus: arg.restoreFocus })
      }
    },
    [parentHierarchy, restoreFocusOnClose, restoreFocusToTrigger, setOpenState],
  )

  const resolveActionElement = React.useCallback(
    (target: HTMLElement, attr: string) => {
      const match = target.closest<HTMLElement>(`[${attr}]`)
      if (!match) return null
      if (!containTriggers) return match
      const scope = containerRef.current
      const nearestScope = match.closest<HTMLElement>('[data-reveal-scope]')
      if (scope && nearestScope && nearestScope !== scope) {
        return null
      }
      return match
    },
    [containTriggers],
  )

  const syncDelegatedA11y = React.useCallback(() => {
    const scope = containerRef.current
    if (!scope) return

    const triggerElements = Array.from(scope.querySelectorAll<HTMLElement>(`[${triggerAttr}]`))
    let nextDelegatedTriggerId: string | undefined

    for (const [index, element] of triggerElements.entries()) {
      if (!element.id) {
        element.id = `${instanceId}-trigger-${index + 1}`
      }
      if (!nextDelegatedTriggerId) {
        nextDelegatedTriggerId = element.id
      }
      element.setAttribute('aria-expanded', String(isOpen))
      element.setAttribute('aria-controls', contentId)
      element.setAttribute('data-state', isOpen ? 'open' : 'closed')
      element.setAttribute('data-phase', phase)
      if (disabled) {
        element.setAttribute('aria-disabled', 'true')
        element.setAttribute('data-disabled', '')
      } else {
        element.removeAttribute('aria-disabled')
        element.removeAttribute('data-disabled')
      }
      if (!isNaturallyInteractive(element) && !element.hasAttribute('role')) {
        element.setAttribute('role', 'button')
      }
      if (!isFocusable(element) && !element.hasAttribute('tabindex')) {
        element.tabIndex = 0
      }
    }

    const restoreElements = Array.from(scope.querySelectorAll<HTMLElement>(`[${restoreAttr}]`))

    for (const element of restoreElements) {
      element.setAttribute('aria-controls', contentId)
      element.setAttribute('data-state', isOpen ? 'open' : 'closed')
      element.setAttribute('data-phase', phase)
      if (disabled) {
        element.setAttribute('aria-disabled', 'true')
        element.setAttribute('data-disabled', '')
      } else {
        element.removeAttribute('aria-disabled')
        element.removeAttribute('data-disabled')
      }
      if (!isNaturallyInteractive(element) && !element.hasAttribute('role')) {
        element.setAttribute('role', 'button')
      }
      if (!isFocusable(element) && !element.hasAttribute('tabindex')) {
        element.tabIndex = 0
      }
    }

    setDelegatedTriggerId(nextDelegatedTriggerId)
  }, [contentId, disabled, instanceId, isOpen, phase, restoreAttr, triggerAttr])

  React.useEffect(() => {
    syncDelegatedA11y()
  }, [syncDelegatedA11y])

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return

      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const triggerElement = resolveActionElement(target, triggerAttr)
      if (triggerElement) {
        event.preventDefault()
        if (containTriggers) {
          event.stopPropagation()
        }
        setLastTrigger(triggerElement)
        setExplicitTriggerId(triggerElement.id || `${instanceId}-trigger-active`)
        if (!triggerElement.id) {
          triggerElement.id = `${instanceId}-trigger-active`
        }
        open()
        return
      }

      const restoreElement = resolveActionElement(target, restoreAttr)
      if (restoreElement) {
        event.preventDefault()
        if (containTriggers) {
          event.stopPropagation()
        }
        close()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !activateWithKeyboard(event)) return

      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const triggerElement = resolveActionElement(target, triggerAttr)
      if (triggerElement) {
        event.preventDefault()
        setLastTrigger(triggerElement)
        setExplicitTriggerId(triggerElement.id || `${instanceId}-trigger-active`)
        if (!triggerElement.id) {
          triggerElement.id = `${instanceId}-trigger-active`
        }
        open()
        return
      }

      const restoreElement = resolveActionElement(target, restoreAttr)
      if (restoreElement) {
        event.preventDefault()
        close()
      }
    }

    node.addEventListener('click', handleClick)
    node.addEventListener('keydown', handleKeyDown)

    return () => {
      node.removeEventListener('click', handleClick)
      node.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    close,
    containTriggers,
    instanceId,
    open,
    resolveActionElement,
    restoreAttr,
    setExplicitTriggerId,
    setLastTrigger,
    triggerAttr,
  ])

  const { topRegion, bottomRegion } = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children)
    let top: React.ReactNode[] = []
    let bottom: React.ReactNode[] = []

    const hasSplitMarker = (
      child: React.ReactNode,
      marker: 'data-split-top' | 'data-split-bottom',
    ) => {
      if (!React.isValidElement(child)) return false
      return Boolean((child.props as Record<string, unknown>)[marker])
    }

    const topMatch = childrenArray.filter(
      (child) =>
        React.isValidElement(child) &&
        (child.type === Top || hasSplitMarker(child, 'data-split-top')),
    )
    const bottomMatch = childrenArray.filter(
      (child) =>
        React.isValidElement(child) &&
        (child.type === Bottom || hasSplitMarker(child, 'data-split-bottom')),
    )

    if (topMatch.length > 0 || bottomMatch.length > 0) {
      top = topMatch
      bottom = bottomMatch
    } else if (autoSplit && childrenArray.length >= 2) {
      const midpoint = Math.ceil(childrenArray.length / 2)
      top = childrenArray.slice(0, midpoint)
      bottom = childrenArray.slice(midpoint)
    } else {
      if (isDevelopment) {
        console.warn(
          'RevealPanel: No explicit Top/Bottom regions found. Use <RevealPanel.Top> and <RevealPanel.Bottom> or data-split-top/bottom attributes.',
        )
      }
      top = childrenArray
    }

    return { topRegion: top, bottomRegion: bottom }
  }, [autoSplit, children])

  const hierarchyContextValue = React.useMemo(() => ({ close }), [close])
  const labelledById = explicitTriggerId ?? delegatedTriggerId
  const revealContextValue = React.useMemo<RevealItemContextValue>(
    () => ({
      isOpen,
      phase,
      disabled,
      contentId,
      triggerId: labelledById,
      setLastTrigger,
      setExplicitTriggerId,
      open,
      close,
    }),
    [
      close,
      contentId,
      disabled,
      isOpen,
      labelledById,
      open,
      phase,
      setExplicitTriggerId,
      setLastTrigger,
    ],
  )

  const resolveScrollableAncestor = React.useCallback((element: HTMLElement | null) => {
    if (!element || typeof window === 'undefined') return null
    let current: HTMLElement | null = element.parentElement

    while (current) {
      const style = window.getComputedStyle(current)
      const overflowY = style.overflowY
      const overflow = style.overflow
      const isScrollable =
        (overflowY === 'auto' ||
          overflowY === 'scroll' ||
          overflow === 'auto' ||
          overflow === 'scroll') &&
        current.scrollHeight > current.clientHeight

      if (isScrollable) return current
      current = current.parentElement
    }

    return (document.scrollingElement as HTMLElement | null) ?? null
  }, [])

  const getMaxScroll = React.useCallback(
    (ancestor: HTMLElement) => Math.max(0, ancestor.scrollHeight - ancestor.clientHeight),
    [],
  )

  const isWindowScrollElement = React.useCallback(
    (element: HTMLElement | null | undefined) =>
      !element ||
      element === document.body ||
      element === document.documentElement ||
      element === document.scrollingElement,
    [],
  )

  const isScrollableElement = React.useCallback((element: HTMLElement) => {
    const style = window.getComputedStyle(element)
    const overflowY = style.overflowY
    const overflow = style.overflow
    return (
      overflowY === 'auto' || overflowY === 'scroll' || overflow === 'auto' || overflow === 'scroll'
    )
  }, [])

  const resolveContainer = React.useCallback(
    (value: HTMLElement | null | (() => HTMLElement | null) | undefined) => {
      if (!value) return null
      return typeof value === 'function' ? value() : value
    },
    [],
  )

  const resolveBestScrollContainer = React.useCallback(
    (container: HTMLElement) => {
      const preferred = resolveContainer(scrollContainer)
      if (preferred) return preferred

      let current: HTMLElement | null = container.parentElement
      while (current) {
        if (isScrollableElement(current)) return current
        current = current.parentElement
      }

      return resolveScrollableAncestor(container)
    },
    [isScrollableElement, resolveContainer, resolveScrollableAncestor, scrollContainer],
  )

  const resolvePrimaryScrollTarget = React.useCallback(
    (container: HTMLDivElement | null): ResolvedPrimaryScrollTarget | null => {
      if (!container) return null

      const resolvedScrollContainer = resolveBestScrollContainer(container)
      if (!resolvedScrollContainer || isWindowScrollElement(resolvedScrollContainer)) {
        return typeof window === 'undefined' ? null : { kind: 'window' }
      }

      return { kind: 'element', element: resolvedScrollContainer }
    },
    [isWindowScrollElement, resolveBestScrollContainer],
  )

  const getTargetTopWithinContainer = React.useCallback(
    (target: HTMLElement, ancestor: HTMLElement) => {
      const targetRect = target.getBoundingClientRect()
      const ancestorRect = ancestor.getBoundingClientRect()
      return ancestor.scrollTop + (targetRect.top - ancestorRect.top) - scrollOffset
    },
    [scrollOffset],
  )

  const getCurrentScrollTop = React.useCallback((target: ResolvedPrimaryScrollTarget) => {
    if (target.kind === 'element') return target.element.scrollTop
    return typeof window === 'undefined' ? 0 : window.scrollY
  }, [])

  const animateScroll = React.useCallback(
    (from: number, to: number, setValue: (value: number) => void, shouldCancel?: () => boolean) => {
      if (prefersReducedMotion || scrollDurationMs <= 0) {
        setValue(to)
        return
      }

      const overshoot = scrollOvershootPx > 0 ? Math.sign(to - from) * scrollOvershootPx : 0
      const midpoint = to + overshoot
      const phaseOne = scrollDurationMs * 0.7
      const phaseTwo = scrollDurationMs * 0.3
      const start = performance.now()
      const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3
      const easeOutQuad = (progress: number) => 1 - (1 - progress) * (1 - progress)

      const tick = (now: number) => {
        if (shouldCancel?.()) return

        const elapsed = now - start
        if (elapsed <= phaseOne) {
          const progress = Math.min(1, elapsed / phaseOne)
          setValue(from + (midpoint - from) * easeOutCubic(progress))
          requestAnimationFrame(tick)
          return
        }

        const progress = Math.min(1, (elapsed - phaseOne) / phaseTwo)
        setValue(midpoint + (to - midpoint) * easeOutQuad(progress))
        if (progress < 1) {
          requestAnimationFrame(tick)
        }
      }

      requestAnimationFrame(tick)
    },
    [prefersReducedMotion, scrollDurationMs, scrollOvershootPx],
  )

  const scrollPrimaryTargetTo = React.useCallback(
    (
      target: ResolvedPrimaryScrollTarget,
      nextTop: number,
      animated: boolean,
      shouldCancel?: () => boolean,
    ) => {
      const from = getCurrentScrollTop(target)
      const to =
        target.kind === 'element'
          ? Math.max(0, Math.min(nextTop, getMaxScroll(target.element)))
          : Math.max(0, nextTop)

      const setValue = (value: number) => {
        if (target.kind === 'element') {
          target.element.scrollTop = value
          return
        }
        window.scrollTo({ top: value, left: 0 })
      }

      if (animated) {
        animateScroll(from, to, setValue, shouldCancel)
      } else {
        setValue(to)
      }

      return { from, to }
    },
    [animateScroll, getCurrentScrollTop, getMaxScroll],
  )

  const markDidAutoScroll = React.useCallback(
    (target: ResolvedPrimaryScrollTarget, from: number, to: number) => {
      if (!restoreScrollOnClose || Math.abs(to - from) <= 0.5) return

      const snapshot = restoreScrollSnapshotRef.current
      if (!snapshot || snapshot.kind !== target.kind) return
      if (
        snapshot.kind === 'element' &&
        target.kind === 'element' &&
        snapshot.element !== target.element
      ) {
        return
      }

      snapshot.didAutoScroll = true
    },
    [restoreScrollOnClose],
  )

  const previousOpenForScrollRestoreRef = React.useRef<boolean | null>(null)

  React.useLayoutEffect(() => {
    const wasOpen = previousOpenForScrollRestoreRef.current
    previousOpenForScrollRestoreRef.current = isOpen

    if (!isOpen || wasOpen === true) return

    restoreScrollSnapshotRef.current = null
    restoreScrollStartedRef.current = false
    if (!scrollOnOpen || !restoreScrollOnClose) return

    const target = resolvePrimaryScrollTarget(containerRef.current)
    if (!target) return

    restoreScrollSnapshotRef.current =
      target.kind === 'element'
        ? {
            kind: 'element',
            element: target.element,
            top: target.element.scrollTop,
            didAutoScroll: false,
          }
        : {
            kind: 'window',
            top: getCurrentScrollTop(target),
            didAutoScroll: false,
          }
  }, [getCurrentScrollTop, isOpen, resolvePrimaryScrollTarget, restoreScrollOnClose, scrollOnOpen])

  React.useEffect(() => {
    if (!scrollOnOpen || !isOpen) return
    if (hasAutoScrolledThisOpenRef.current) return
    hasAutoScrolledThisOpenRef.current = true

    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    const applyCascade = (
      primaryContainer: HTMLElement | null,
      immediate: boolean,
      options?: { strict?: boolean },
    ) => {
      let maxDelta = 0
      const steps = scrollCascade ?? []
      const deadbandPx = options?.strict ? 0 : 8
      const maxStepPx = options?.strict ? Number.POSITIVE_INFINITY : 48

      const clampStep = (value: number) => {
        if (value > maxStepPx) return maxStepPx
        if (value < -maxStepPx) return -maxStepPx
        return value
      }

      for (const step of steps) {
        const element = resolveContainer(step.container)
        if (!element || element === primaryContainer) continue

        const targetRect = container.getBoundingClientRect()
        const hostRect = element.getBoundingClientRect()

        if (step.mode === 'align-top') {
          const offset = step.offset ?? 0
          const deltaToTop = targetRect.top - hostRect.top - offset
          if (Math.abs(deltaToTop) <= deadbandPx) continue
          const targetTop = element.scrollTop + clampStep(deltaToTop)
          const clamped = Math.max(0, Math.min(targetTop, getMaxScroll(element)))
          if (immediate) {
            element.scrollTop = clamped
          } else {
            const from = element.scrollTop
            animateScroll(
              from,
              clamped,
              (value) => {
                element.scrollTop = value
              },
              () => cancelled,
            )
          }
          maxDelta = Math.max(maxDelta, Math.abs(deltaToTop))
          continue
        }

        const topBoundary = step.offset ?? 0
        const bottomBoundary = element.clientHeight - (step.padding ?? 16)
        const top = targetRect.top - hostRect.top
        const bottom = targetRect.bottom - hostRect.top
        let nextScroll = element.scrollTop

        if (top < topBoundary - deadbandPx) {
          const delta = clampStep(top - topBoundary)
          nextScroll += delta
          maxDelta = Math.max(maxDelta, Math.abs(top - topBoundary))
        } else if (bottom > bottomBoundary + deadbandPx) {
          const delta = clampStep(bottom - bottomBoundary)
          nextScroll += delta
          maxDelta = Math.max(maxDelta, Math.abs(bottom - bottomBoundary))
        }

        if (nextScroll !== element.scrollTop) {
          const clamped = Math.max(0, Math.min(nextScroll, getMaxScroll(element)))
          if (immediate) {
            element.scrollTop = clamped
          } else {
            const from = element.scrollTop
            animateScroll(
              from,
              clamped,
              (value) => {
                element.scrollTop = value
              },
              () => cancelled,
            )
          }
        }
      }

      return maxDelta
    }

    const alignToTop = (
      animated: boolean,
      options?: { includeCascade?: boolean; cascadeImmediate?: boolean; strictCascade?: boolean },
    ) => {
      if (cancelled) return null

      const primaryTarget = resolvePrimaryScrollTarget(container)
      if (!primaryTarget) return null

      const includeCascade = options?.includeCascade ?? true
      const cascadeDelta = includeCascade
        ? applyCascade(
            primaryTarget.kind === 'element' ? primaryTarget.element : null,
            options?.cascadeImmediate ?? true,
            {
              strict: options?.strictCascade,
            },
          )
        : 0

      if (primaryTarget.kind === 'element') {
        const targetTop = getTargetTopWithinContainer(container, primaryTarget.element)
        const maxScroll = getMaxScroll(primaryTarget.element)
        const neededExtra = targetTop > maxScroll ? targetTop - maxScroll : 0

        if (neededExtra > 0) {
          if (scrollSpacerTarget === 'self') {
            if (neededExtra !== extraScrollSpaceRef.current) {
              extraScrollSpaceRef.current = neededExtra
              setExtraScrollSpace(neededExtra)
              return { pending: true as const }
            }
          } else if (scrollSpacerTarget === 'container') {
            if (
              !containerPaddingRef.current ||
              containerPaddingRef.current.el !== primaryTarget.element
            ) {
              containerPaddingRef.current = {
                el: primaryTarget.element,
                paddingBottom: primaryTarget.element.style.paddingBottom || '',
              }
            }
            const basePadding = parseFloat(
              window.getComputedStyle(primaryTarget.element).paddingBottom || '0',
            )
            primaryTarget.element.style.paddingBottom = `${basePadding + neededExtra}px`
          }
        } else if (
          scrollSpacerTarget === 'container' &&
          containerPaddingRef.current?.el === primaryTarget.element
        ) {
          primaryTarget.element.style.paddingBottom = containerPaddingRef.current.paddingBottom
        }

        const { from, to } = scrollPrimaryTargetTo(
          primaryTarget,
          targetTop,
          animated,
          () => cancelled,
        )
        markDidAutoScroll(primaryTarget, from, to)

        const containerRect = primaryTarget.element.getBoundingClientRect()
        const delta = container.getBoundingClientRect().top - containerRect.top - scrollOffset
        return { pending: false as const, delta: Math.max(Math.abs(delta), cascadeDelta) }
      }

      const target =
        getCurrentScrollTop(primaryTarget) + container.getBoundingClientRect().top - scrollOffset
      const { from, to } = scrollPrimaryTargetTo(primaryTarget, target, animated, () => cancelled)
      markDidAutoScroll(primaryTarget, from, to)
      const delta = container.getBoundingClientRect().top - scrollOffset
      return { pending: false as const, delta: Math.max(Math.abs(delta), cascadeDelta) }
    }

    const settleAlignment = () => {
      const hasCascade = (scrollCascade?.length ?? 0) > 0
      const startedAt = performance.now()
      let stableFrames = 0

      const tick = () => {
        if (cancelled) return
        const result = alignToTop(false, { includeCascade: true, cascadeImmediate: true })
        if (!result) return
        if (result.pending) {
          requestAnimationFrame(tick)
          return
        }
        if (Math.abs(result.delta) <= 2) {
          stableFrames += 1
        } else {
          stableFrames = 0
        }
        if (stableFrames >= 2) return
        if (performance.now() - startedAt >= (hasCascade ? 350 : 700)) return
        requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    }

    const alignUntilReady = (
      options: { includeCascade: boolean; cascadeImmediate?: boolean; strictCascade?: boolean },
      maxAttempts = 3,
    ) => {
      let attempts = 0

      const step = () => {
        if (cancelled) return
        const result = alignToTop(false, options)
        if (!result) return
        if (result.pending && attempts < maxAttempts) {
          attempts += 1
          requestAnimationFrame(step)
        }
      }

      step()
    }

    if ((scrollCascade?.length ?? 0) > 0) {
      requestAnimationFrame(() => {
        if (cancelled) return
        alignUntilReady({ includeCascade: false })
        settleTimer = setTimeout(
          () => {
            if (cancelled) return
            alignUntilReady({ includeCascade: true, cascadeImmediate: true }, 4)
            requestAnimationFrame(() => {
              if (cancelled) return
              alignUntilReady(
                { includeCascade: true, cascadeImmediate: true, strictCascade: true },
                6,
              )
            })
          },
          Math.max(scrollDurationMs, 420),
        )
      })

      return () => {
        cancelled = true
        if (settleTimer) clearTimeout(settleTimer)
      }
    }

    requestAnimationFrame(() => {
      if (cancelled) return
      requestAnimationFrame(() => {
        if (cancelled) return
        const first = alignToTop(!prefersReducedMotion, { includeCascade: false })
        if (!first) return
        if (first.pending) {
          requestAnimationFrame(settleAlignment)
          return
        }
        if (prefersReducedMotion || scrollDurationMs <= 0) {
          settleAlignment()
          return
        }
        settleTimer = setTimeout(settleAlignment, Math.min(scrollDurationMs + 64, 520))
      })
    })

    return () => {
      cancelled = true
      if (settleTimer) clearTimeout(settleTimer)
    }
  }, [
    isOpen,
    prefersReducedMotion,
    resolvePrimaryScrollTarget,
    scrollCascade,
    scrollDurationMs,
    scrollOffset,
    scrollOnOpen,
    scrollSpacerTarget,
    scrollPrimaryTargetTo,
    getCurrentScrollTop,
    getMaxScroll,
    getTargetTopWithinContainer,
    resolveContainer,
    markDidAutoScroll,
    animateScroll,
  ])

  React.useEffect(() => {
    if (!isOpen) {
      hasAutoScrolledThisOpenRef.current = false
    }
  }, [isOpen])

  React.useEffect(() => {
    if (!group) return
    return group.register(instanceId, close)
  }, [close, group, instanceId])

  React.useEffect(() => {
    if (!isOpen && extraScrollSpaceRef.current !== 0) {
      extraScrollSpaceRef.current = 0
      setExtraScrollSpace(0)
    }
    if (!isOpen && containerPaddingRef.current) {
      const { el, paddingBottom } = containerPaddingRef.current
      el.style.paddingBottom = paddingBottom
      containerPaddingRef.current = null
    }
  }, [isOpen])

  React.useEffect(() => {
    if (isOpen || phase === 'opening' || phase === 'open') {
      restoreScrollStartedRef.current = false
      return
    }

    if (phase !== 'closing' && phase !== 'closed') return
    if (restoreScrollStartedRef.current) return

    const snapshot = restoreScrollSnapshotRef.current
    restoreScrollStartedRef.current = true
    restoreScrollSnapshotRef.current = null

    if (!restoreScrollOnClose || !snapshot?.didAutoScroll) return
    if (snapshot.kind === 'element' && !snapshot.element.isConnected) return

    let cancelled = false
    let frame = 0
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    const restore = () => {
      if (cancelled) return

      const target: ResolvedPrimaryScrollTarget =
        snapshot.kind === 'element'
          ? { kind: 'element', element: snapshot.element }
          : { kind: 'window' }

      const settleRestore = () => {
        const startedAt = performance.now()
        let stableFrames = 0

        const tick = () => {
          if (cancelled) return

          scrollPrimaryTargetTo(target, snapshot.top, false, () => cancelled)
          if (Math.abs(getCurrentScrollTop(target) - snapshot.top) <= 2) {
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

      scrollPrimaryTargetTo(target, snapshot.top, !prefersReducedMotion, () => cancelled)
      settleTimer = setTimeout(
        () => {
          if (cancelled) return
          settleRestore()
        },
        prefersReducedMotion || scrollDurationMs <= 0 ? 0 : Math.min(scrollDurationMs + 64, 520),
      )
    }

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      frame = window.requestAnimationFrame(restore)
      return () => {
        cancelled = true
        if (settleTimer) clearTimeout(settleTimer)
        window.cancelAnimationFrame(frame)
      }
    }

    restore()
    return () => {
      cancelled = true
      if (settleTimer) clearTimeout(settleTimer)
    }
  }, [
    getCurrentScrollTop,
    isOpen,
    phase,
    prefersReducedMotion,
    restoreScrollOnClose,
    scrollDurationMs,
    scrollPrimaryTargetTo,
  ])

  const shellEase = [0.22, 1, 0.36, 1] as [number, number, number, number]
  const contentEase = [0.4, 0, 0.2, 1] as [number, number, number, number]

  const contentTransition: Transition = prefersReducedMotion
    ? { height: { duration: 0 }, opacity: { duration: 0 } }
    : {
        height: { duration: 0.4, ease: contentEase },
        opacity: { duration: 0.25, delay: 0.05 },
      }

  const shellTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: shellEase }

  const openingPhaseDurationMs = prefersReducedMotion ? 0 : magicMotion ? 500 : 400
  const closingPhaseDurationMs = prefersReducedMotion ? 0 : 400
  const isContentVisible = phase === 'opening' || phase === 'open'
  const shouldRenderContent = hasResolvedContent && (keepMounted || phase !== 'closed')
  const contentHiddenStyles = {
    height: 0,
    opacity: 0,
    filter: magicMotion && !prefersReducedMotion ? `blur(${revealBlurPx}px)` : undefined,
  }
  const contentVisibleStyles = {
    height: 'auto',
    opacity: 1,
    filter: magicMotion && !prefersReducedMotion ? 'blur(0px)' : undefined,
  }

  React.useEffect(() => {
    if (previousOpenRef.current === isOpen) return

    previousOpenRef.current = isOpen
    clearPhaseTimer()
    setPhase(
      isOpen
        ? openingPhaseDurationMs === 0
          ? 'open'
          : 'opening'
        : closingPhaseDurationMs === 0
          ? 'closed'
          : 'closing',
    )
  }, [clearPhaseTimer, closingPhaseDurationMs, isOpen, openingPhaseDurationMs])

  React.useEffect(() => {
    clearPhaseTimer()

    if (phase === 'opening') {
      phaseTimerRef.current = setTimeout(() => {
        phaseTimerRef.current = null
        setPhase((currentPhase) => (currentPhase === 'opening' ? 'open' : currentPhase))
      }, openingPhaseDurationMs)
      return clearPhaseTimer
    }

    if (phase === 'closing') {
      phaseTimerRef.current = setTimeout(() => {
        phaseTimerRef.current = null
        setPhase((currentPhase) => (currentPhase === 'closing' ? 'closed' : currentPhase))
      }, closingPhaseDurationMs)
      return clearPhaseTimer
    }

    return clearPhaseTimer
  }, [clearPhaseTimer, closingPhaseDurationMs, openingPhaseDurationMs, phase])

  React.useEffect(() => clearPhaseTimer, [clearPhaseTimer])

  return (
    <LayoutGroup>
      <RevealHierarchyContext.Provider value={hierarchyContextValue}>
        <RevealItemContext.Provider value={revealContextValue}>
          <div
            className={cn('relative overflow-hidden', className)}
            ref={setContainerNode}
            data-reveal-scope
            data-state={isOpen ? 'open' : 'closed'}
            data-phase={phase}
            data-disabled={disabled ? '' : undefined}
          >
            <motion.div
              layout={magicMotion && !prefersReducedMotion}
              className="relative z-10"
              data-state={isOpen ? 'open' : 'closed'}
              data-phase={phase}
              animate={
                magicMotion && !prefersReducedMotion
                  ? { y: isOpen ? -parallaxOffset : 0 }
                  : undefined
              }
              transition={magicMotion ? shellTransition : undefined}
            >
              {topRegion}
            </motion.div>

            {shouldRenderContent ? (
              <motion.div
                id={contentId}
                role="region"
                hidden={keepMounted && phase === 'closed'}
                aria-labelledby={labelledById}
                aria-label={labelledById ? undefined : regionLabel}
                aria-hidden={!isContentVisible ? true : undefined}
                data-state={isOpen ? 'open' : 'closed'}
                data-phase={phase}
                initial={phase === 'open' ? false : contentHiddenStyles}
                animate={isContentVisible ? contentVisibleStyles : contentHiddenStyles}
                transition={contentTransition}
                className={cn(
                  'relative z-0 overflow-hidden',
                  !isContentVisible && 'pointer-events-none',
                )}
              >
                <motion.div layout={magicMotion && !prefersReducedMotion}>
                  {typeof resolvedContent === 'function'
                    ? resolvedContent({
                        close,
                        open,
                        isOpen,
                        phase,
                        contentId,
                        triggerId: labelledById,
                      })
                    : resolvedContent}
                </motion.div>
              </motion.div>
            ) : null}

            <motion.div
              layout={magicMotion && !prefersReducedMotion}
              className="relative z-10"
              data-state={isOpen ? 'open' : 'closed'}
              data-phase={phase}
              animate={
                magicMotion && !prefersReducedMotion
                  ? { y: isOpen ? parallaxOffset : 0 }
                  : undefined
              }
              transition={magicMotion ? shellTransition : undefined}
            >
              {bottomRegion}
            </motion.div>

            {scrollSpacerTarget === 'self' && extraScrollSpace > 0 ? (
              <div
                aria-hidden
                className="pointer-events-none"
                style={{ height: extraScrollSpace }}
              />
            ) : null}
          </div>
        </RevealItemContext.Provider>
      </RevealHierarchyContext.Provider>
    </LayoutGroup>
  )
})

export const RevealPanel = Object.assign(RevealPanelBase, {
  Bottom,
  Close: RevealClose,
  Top,
  Trigger: RevealTrigger,
}) as RevealPanelComponent

RevealPanel.displayName = 'RevealPanel'

RevealTrigger.displayName = 'RevealTrigger'
RevealClose.displayName = 'RevealClose'
