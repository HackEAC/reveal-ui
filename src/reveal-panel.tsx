/* biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: motion and nested scroll coordination intentionally stay co-located in the public primitive. */
'use client'

import { Slot } from '@radix-ui/react-slot'
import { type ClassValue, clsx } from 'clsx'
import { AnimatePresence, LayoutGroup, motion, type Transition } from 'motion/react'
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

export type RevealRenderProps = {
  close: (arg?: CloseOptions) => void
  open: () => void
  isOpen: boolean
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

type RevealGroupContextValue = {
  register: (id: string, close: (arg?: CloseOptions) => void) => () => void
  closeOthers: (id: string) => void
  closeSiblingsDefault: boolean
}

type RevealHierarchyContextValue = {
  close: (arg?: CloseOptions) => void
}

type RevealItemContextValue = {
  isOpen: boolean
  disabled: boolean
  contentId: string
  triggerId?: string
  setLastTrigger: (node: HTMLElement | null) => void
  setExplicitTriggerId: (id: string) => void
  open: () => void
  close: (arg?: CloseOptions) => void
}

const RevealGroupContext = React.createContext<RevealGroupContextValue | null>(null)
const RevealHierarchyContext = React.createContext<RevealHierarchyContextValue | null>(null)
const RevealItemContext = React.createContext<RevealItemContextValue | null>(null)

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
    const { isOpen, contentId, setLastTrigger, setExplicitTriggerId, open } = context
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
  const [isOpen, setOpenState] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasAutoScrolledThisOpenRef = React.useRef(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const lastTriggerRef = React.useRef<HTMLElement | null>(null)
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

  if (!resolvedContent && isDevelopment) {
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
  }, [contentId, disabled, instanceId, isOpen, restoreAttr, triggerAttr])

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
      disabled,
      contentId,
      triggerId: labelledById,
      setLastTrigger,
      setExplicitTriggerId,
      open,
      close,
    }),
    [close, contentId, disabled, isOpen, labelledById, open, setExplicitTriggerId, setLastTrigger],
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

  React.useEffect(() => {
    if (!scrollOnOpen || !isOpen) return
    if (hasAutoScrolledThisOpenRef.current) return
    hasAutoScrolledThisOpenRef.current = true

    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    const getMaxScroll = (ancestor: HTMLElement) =>
      Math.max(0, ancestor.scrollHeight - ancestor.clientHeight)

    const isScrollableElement = (element: HTMLElement) => {
      const style = window.getComputedStyle(element)
      const overflowY = style.overflowY
      const overflow = style.overflow
      return (
        overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflow === 'auto' ||
        overflow === 'scroll'
      )
    }

    const getTargetTopWithinContainer = (target: HTMLElement, ancestor: HTMLElement) => {
      const targetRect = target.getBoundingClientRect()
      const ancestorRect = ancestor.getBoundingClientRect()
      return ancestor.scrollTop + (targetRect.top - ancestorRect.top) - scrollOffset
    }

    const resolveBestScrollContainer = () => {
      const preferred = typeof scrollContainer === 'function' ? scrollContainer() : scrollContainer
      if (preferred) return preferred

      let current: HTMLElement | null = container.parentElement
      while (current) {
        if (isScrollableElement(current)) return current
        current = current.parentElement
      }

      return resolveScrollableAncestor(container)
    }

    const resolveContainer = (
      value: HTMLElement | null | (() => HTMLElement | null) | undefined,
    ) => {
      if (!value) return null
      return typeof value === 'function' ? value() : value
    }

    const animateScroll = (from: number, to: number, setValue: (value: number) => void) => {
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
        if (cancelled) return

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
    }

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
            animateScroll(from, clamped, (value) => {
              element.scrollTop = value
            })
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
            animateScroll(from, clamped, (value) => {
              element.scrollTop = value
            })
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

      const resolvedScrollContainer = resolveBestScrollContainer()
      const includeCascade = options?.includeCascade ?? true
      const cascadeDelta = includeCascade
        ? applyCascade(resolvedScrollContainer, options?.cascadeImmediate ?? true, {
            strict: options?.strictCascade,
          })
        : 0

      const isWindowScrollTarget =
        !resolvedScrollContainer ||
        resolvedScrollContainer === document.body ||
        resolvedScrollContainer === document.documentElement ||
        resolvedScrollContainer === document.scrollingElement

      if (!isWindowScrollTarget && resolvedScrollContainer) {
        const targetTop = getTargetTopWithinContainer(container, resolvedScrollContainer)
        const maxScroll = getMaxScroll(resolvedScrollContainer)
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
              containerPaddingRef.current.el !== resolvedScrollContainer
            ) {
              containerPaddingRef.current = {
                el: resolvedScrollContainer,
                paddingBottom: resolvedScrollContainer.style.paddingBottom || '',
              }
            }
            const basePadding = parseFloat(
              window.getComputedStyle(resolvedScrollContainer).paddingBottom || '0',
            )
            resolvedScrollContainer.style.paddingBottom = `${basePadding + neededExtra}px`
          }
        } else if (
          scrollSpacerTarget === 'container' &&
          containerPaddingRef.current?.el === resolvedScrollContainer
        ) {
          resolvedScrollContainer.style.paddingBottom = containerPaddingRef.current.paddingBottom
        }

        const from = resolvedScrollContainer.scrollTop
        const finalTarget = Math.max(0, Math.min(targetTop, getMaxScroll(resolvedScrollContainer)))
        if (animated) {
          animateScroll(from, finalTarget, (value) => {
            resolvedScrollContainer.scrollTop = value
          })
        } else {
          resolvedScrollContainer.scrollTop = finalTarget
        }

        const containerRect = resolvedScrollContainer.getBoundingClientRect()
        const delta = container.getBoundingClientRect().top - containerRect.top - scrollOffset
        return { pending: false as const, delta: Math.max(Math.abs(delta), cascadeDelta) }
      }

      if (typeof window !== 'undefined') {
        const from = window.scrollY
        const rect = container.getBoundingClientRect()
        const target = from + rect.top - scrollOffset
        if (animated) {
          animateScroll(from, target, (value) => {
            window.scrollTo({ top: value, left: 0 })
          })
        } else {
          window.scrollTo({ top: target, left: 0 })
        }
        const delta = container.getBoundingClientRect().top - scrollOffset
        return { pending: false as const, delta: Math.max(Math.abs(delta), cascadeDelta) }
      }

      container.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return { pending: false as const, delta: cascadeDelta }
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
    resolveScrollableAncestor,
    scrollCascade,
    scrollContainer,
    scrollDurationMs,
    scrollOffset,
    scrollOnOpen,
    scrollOvershootPx,
    scrollSpacerTarget,
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

  return (
    <LayoutGroup>
      <RevealHierarchyContext.Provider value={hierarchyContextValue}>
        <RevealItemContext.Provider value={revealContextValue}>
          <div
            className={cn('relative overflow-hidden', className)}
            ref={setContainerNode}
            data-reveal-scope
            data-state={isOpen ? 'open' : 'closed'}
            data-disabled={disabled ? '' : undefined}
          >
            <motion.div
              layout={magicMotion && !prefersReducedMotion}
              className="relative z-10"
              data-state={isOpen ? 'open' : 'closed'}
              animate={
                magicMotion && !prefersReducedMotion
                  ? { y: isOpen ? -parallaxOffset : 0 }
                  : undefined
              }
              transition={magicMotion ? shellTransition : undefined}
            >
              {topRegion}
            </motion.div>

            <AnimatePresence initial={false}>
              {isOpen && resolvedContent ? (
                <motion.div
                  id={contentId}
                  role="region"
                  aria-labelledby={labelledById}
                  aria-label={labelledById ? undefined : regionLabel}
                  data-state={isOpen ? 'open' : 'closed'}
                  initial={{
                    height: 0,
                    opacity: 0,
                    filter:
                      magicMotion && !prefersReducedMotion ? `blur(${revealBlurPx}px)` : undefined,
                  }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    filter: magicMotion && !prefersReducedMotion ? 'blur(0px)' : undefined,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    filter:
                      magicMotion && !prefersReducedMotion ? `blur(${revealBlurPx}px)` : undefined,
                  }}
                  transition={contentTransition}
                  className="relative z-0 overflow-hidden"
                >
                  <motion.div layout={magicMotion && !prefersReducedMotion}>
                    {typeof resolvedContent === 'function'
                      ? resolvedContent({
                          close,
                          open,
                          isOpen,
                          contentId,
                          triggerId: labelledById,
                        })
                      : resolvedContent}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.div
              layout={magicMotion && !prefersReducedMotion}
              className="relative z-10"
              data-state={isOpen ? 'open' : 'closed'}
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

/** @deprecated Use RevealPanel instead. */
export const RevealSplitter = RevealPanel
