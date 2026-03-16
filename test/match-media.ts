type MatchMediaListener = (event: MediaQueryListEvent) => void

let prefersReducedMotion = false
const listeners = new Set<MatchMediaListener>()

function createMediaQueryList(query: string): MediaQueryList {
  const isReducedMotionQuery = query === '(prefers-reduced-motion: reduce)'
  const mediaQueryList = {
    get matches() {
      return isReducedMotionQuery ? prefersReducedMotion : false
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      if (typeof listener === 'function') {
        listeners.add(listener as MatchMediaListener)
      }
    },
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      if (typeof listener === 'function') {
        listeners.delete(listener as MatchMediaListener)
      }
    },
    addListener: (
      listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null,
    ) => {
      if (!listener) {
        return
      }
      listeners.add(listener as unknown as MatchMediaListener)
    },
    removeListener: (
      listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null,
    ) => {
      if (!listener) {
        return
      }
      listeners.delete(listener as unknown as MatchMediaListener)
    },
    dispatchEvent: () => true,
  } satisfies MediaQueryList

  return mediaQueryList
}

export function installMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => createMediaQueryList(query),
    writable: true,
  })
}

export function resetReducedMotionPreference() {
  prefersReducedMotion = false
}

export function setReducedMotionPreference(nextValue: boolean) {
  prefersReducedMotion = nextValue
  const event = {
    matches: nextValue,
    media: '(prefers-reduced-motion: reduce)',
  } as MediaQueryListEvent

  for (const listener of listeners) {
    listener(event)
  }
}
