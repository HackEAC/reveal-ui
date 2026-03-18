import { render } from '@testing-library/react'
import * as React from 'react'
import { ScrollOnRevealAnchor } from '../examples/next-app/components/site/scroll-on-reveal-anchor'

function setElementRect(element: Element, getTop: () => number, height = 1) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => {
      const top = getTop()

      return {
        bottom: top + height,
        height,
        left: 0,
        right: 100,
        toJSON: () => ({}),
        top,
        width: 100,
        x: 0,
        y: top,
      } satisfies DOMRect
    },
  })
}

function installWindowScrollState(initialTop: number) {
  let scrollY = initialTop

  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => scrollY,
  })

  ;(window.scrollTo as unknown as jest.Mock).mockImplementation(
    (options?: ScrollToOptions | number, maybeY?: number) => {
      if (typeof options === 'number') {
        scrollY = maybeY ?? 0
        return
      }

      scrollY = options?.top ?? scrollY
    },
  )

  return {
    getScrollY: () => scrollY,
  }
}

function advanceTimers(ms: number) {
  React.act(() => {
    jest.advanceTimersByTime(ms)
  })
}

describe('ScrollOnRevealAnchor', () => {
  it('starts restoring scroll as soon as the phase enters closing', () => {
    jest.useFakeTimers()

    try {
      const { getScrollY } = installWindowScrollState(120)
      const anchorDocumentTop = 620
      const { container, rerender } = render(
        <ScrollOnRevealAnchor offset={96} phase="opening" restoreOnClose />,
      )

      const anchor = container.firstElementChild
      expect(anchor).not.toBeNull()
      setElementRect(anchor as Element, () => anchorDocumentTop - getScrollY())

      advanceTimers(50)

      expect(getScrollY()).toBe(anchorDocumentTop - 96)
      ;(window.scrollTo as unknown as jest.Mock).mockClear()

      rerender(<ScrollOnRevealAnchor offset={96} phase="closing" restoreOnClose />)

      advanceTimers(20)

      expect(window.scrollTo).toHaveBeenCalled()
      expect(getScrollY()).toBe(120)

      advanceTimers(800)

      expect(getScrollY()).toBe(120)
    } finally {
      jest.useRealTimers()
    }
  })
})
