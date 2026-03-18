import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import * as revealUi from '../src'
import { RevealClose, RevealGroup, RevealPanel, RevealTrigger, useRevealPanelState } from '../src'
import { setReducedMotionPreference } from './match-media'

function setElementRect(element: Element, getTop: () => number, height = 100) {
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

function getScrollToTopCalls() {
  return (window.scrollTo as unknown as jest.Mock).mock.calls.map(
    ([options, maybeY]: [ScrollToOptions | number | undefined, number | undefined]) =>
      typeof options === 'number' ? (maybeY ?? 0) : (options?.top ?? 0),
  )
}

function advanceTimers(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms)
  })
}

describe('RevealPanel', () => {
  it('reveals and restores content through delegated trigger attributes', async () => {
    const user = userEvent.setup()

    render(
      <RevealPanel
        revealContent={
          <div>
            <p>Revealed content</p>
            <button type="button" data-trigger-restore>
              Close
            </button>
          </div>
        }
      >
        <RevealPanel.Top>
          <button type="button" data-trigger-collapse>
            Open
          </button>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <p>Bottom</p>
        </RevealPanel.Bottom>
      </RevealPanel>,
    )

    const trigger = screen.getByRole('button', { name: 'Open' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('data-state', 'closed')
    expect(screen.queryByText('Revealed content')).not.toBeInTheDocument()

    await user.click(trigger)

    expect(screen.getByText('Revealed content')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('data-state', 'open')

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByText('Revealed content')).not.toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-state', 'closed')
    })
  })

  it('supports controlled open state', async () => {
    const user = userEvent.setup()

    function ControlledHarness() {
      const [open, setOpen] = React.useState(false)

      return (
        <RevealPanel open={open} onOpenChange={setOpen} content={<p>Controlled content</p>}>
          <RevealPanel.Top>
            <RevealTrigger>Open controlled</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>
      )
    }

    render(<ControlledHarness />)

    expect(screen.queryByText('Controlled content')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open controlled' }))

    expect(screen.getByText('Controlled content')).toBeInTheDocument()
  })

  it('closes sibling revealers when grouped', async () => {
    const user = userEvent.setup()

    render(
      <RevealGroup closeSiblings>
        <RevealPanel content={<p>First panel</p>}>
          <RevealPanel.Top>
            <button type="button" data-trigger-collapse>
              Open first
            </button>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>

        <RevealPanel content={<p>Second panel</p>}>
          <RevealPanel.Top>
            <button type="button" data-trigger-collapse>
              Open second
            </button>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>
      </RevealGroup>,
    )

    await user.click(screen.getByRole('button', { name: 'Open first' }))
    expect(screen.getByText('First panel')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open second' }))
    expect(screen.getByText('Second panel')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('First panel')).not.toBeInTheDocument()
    })
  })

  it('returns focus to the last explicit trigger after close', async () => {
    const user = userEvent.setup()

    render(
      <RevealPanel
        content={
          <div>
            <p>Focus content</p>
            <RevealClose>Close focus</RevealClose>
          </div>
        }
      >
        <RevealPanel.Top>
          <RevealTrigger>Open focus</RevealTrigger>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <div />
        </RevealPanel.Bottom>
      </RevealPanel>,
    )

    const trigger = screen.getByRole('button', { name: 'Open focus' })

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Close focus' }))

    await waitFor(() => {
      expect(screen.queryByText('Focus content')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
    })
  })

  it('restores the previous window scroll position after close when enabled', () => {
    jest.useFakeTimers()

    try {
      const { getScrollY } = installWindowScrollState(150)
      const documentTop = 620
      const { container } = render(
        <RevealPanel
          scrollOnOpen
          restoreScrollOnClose
          content={
            <div>
              <p>Scroll content</p>
              <RevealClose>Close scroll</RevealClose>
            </div>
          }
        >
          <RevealPanel.Top>
            <RevealTrigger>Open scroll</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      const scope = container.querySelector('[data-reveal-scope]')
      expect(scope).not.toBeNull()
      setElementRect(scope as Element, () => documentTop - getScrollY())

      fireEvent.click(screen.getByRole('button', { name: 'Open scroll' }))

      advanceTimers(1200)

      expect(getScrollY()).toBe(documentTop)
      ;(window.scrollTo as unknown as jest.Mock).mockClear()

      fireEvent.click(screen.getByRole('button', { name: 'Close scroll' }))

      advanceTimers(100)
      expect(window.scrollTo).toHaveBeenCalled()

      advanceTimers(500)
      advanceTimers(800)

      expect(getScrollY()).toBe(150)
    } finally {
      jest.useRealTimers()
    }
  })

  it('restores the previous custom scroll container position after close', () => {
    jest.useFakeTimers()

    const scrollContainer = document.createElement('div')
    scrollContainer.style.overflowY = 'auto'
    scrollContainer.scrollTop = 120
    Object.defineProperty(scrollContainer, 'clientHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(scrollContainer, 'scrollHeight', {
      configurable: true,
      value: 1000,
    })
    setElementRect(scrollContainer, () => 40, 200)
    document.body.appendChild(scrollContainer)

    try {
      const panelContentTop = 280
      const { container } = render(
        <RevealPanel
          scrollOnOpen
          restoreScrollOnClose
          scrollContainer={scrollContainer}
          content={
            <div>
              <p>Container scroll content</p>
              <RevealClose>Close container scroll</RevealClose>
            </div>
          }
        >
          <RevealPanel.Top>
            <RevealTrigger>Open container scroll</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      const scope = container.querySelector('[data-reveal-scope]')
      expect(scope).not.toBeNull()
      setElementRect(scope as Element, () => 40 + panelContentTop - scrollContainer.scrollTop)

      fireEvent.click(screen.getByRole('button', { name: 'Open container scroll' }))

      advanceTimers(1200)

      expect(scrollContainer.scrollTop).toBe(panelContentTop)

      fireEvent.click(screen.getByRole('button', { name: 'Close container scroll' }))

      advanceTimers(500)
      advanceTimers(800)

      expect(scrollContainer.scrollTop).toBe(120)
    } finally {
      scrollContainer.remove()
      jest.useRealTimers()
    }
  })

  it('captures and restores scroll for panels that mount open', () => {
    jest.useFakeTimers()

    const defaultRect = {
      bottom: 100,
      height: 100,
      left: 0,
      right: 100,
      toJSON: () => ({}),
      top: 0,
      width: 100,
      x: 0,
      y: 0,
    } satisfies DOMRect
    let rectSpy: jest.SpyInstance<DOMRect, []> | null = null

    try {
      const { getScrollY } = installWindowScrollState(150)
      const documentTop = 620
      rectSpy = jest
        .spyOn(Element.prototype, 'getBoundingClientRect')
        .mockImplementation(function mockRect(this: Element) {
          if (this instanceof HTMLElement && this.hasAttribute('data-reveal-scope')) {
            const top = documentTop - getScrollY()

            return {
              ...defaultRect,
              bottom: top + defaultRect.height,
              top,
              y: top,
            }
          }

          return defaultRect
        })

      render(
        <RevealPanel
          defaultOpen
          scrollOnOpen
          restoreScrollOnClose
          content={
            <div>
              <p>Mounted open scroll content</p>
              <RevealClose>Close mounted open</RevealClose>
            </div>
          }
        >
          <RevealPanel.Top>
            <RevealTrigger>Open mounted scroll</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      advanceTimers(1200)

      expect(getScrollY()).toBe(documentTop)
      ;(window.scrollTo as unknown as jest.Mock).mockClear()

      fireEvent.click(screen.getByRole('button', { name: 'Close mounted open' }))

      advanceTimers(100)
      expect(window.scrollTo).toHaveBeenCalled()

      advanceTimers(500)
      advanceTimers(800)

      expect(getScrollY()).toBe(150)
    } finally {
      rectSpy?.mockRestore()
      jest.useRealTimers()
    }
  })

  it('does not restore scroll after close when restoreScrollOnClose is disabled', () => {
    jest.useFakeTimers()

    try {
      const { getScrollY } = installWindowScrollState(150)
      const documentTop = 620
      const { container } = render(
        <RevealPanel
          scrollOnOpen
          content={
            <div>
              <p>No restore content</p>
              <RevealClose>Close without restore</RevealClose>
            </div>
          }
        >
          <RevealPanel.Top>
            <RevealTrigger>Open without restore</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      const scope = container.querySelector('[data-reveal-scope]')
      expect(scope).not.toBeNull()
      setElementRect(scope as Element, () => documentTop - getScrollY())

      fireEvent.click(screen.getByRole('button', { name: 'Open without restore' }))

      advanceTimers(1200)

      expect(getScrollY()).toBe(documentTop)

      fireEvent.click(screen.getByRole('button', { name: 'Close without restore' }))

      advanceTimers(500)
      advanceTimers(800)

      expect(getScrollY()).toBe(documentTop)
    } finally {
      jest.useRealTimers()
    }
  })

  it('does not capture or restore scroll when scrollOnOpen is disabled', () => {
    jest.useFakeTimers()

    try {
      const { getScrollY } = installWindowScrollState(150)

      render(
        <RevealPanel
          restoreScrollOnClose
          content={
            <div>
              <p>Static content</p>
              <RevealClose>Close static</RevealClose>
            </div>
          }
        >
          <RevealPanel.Top>
            <RevealTrigger>Open static</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Open static' }))

      advanceTimers(1200)

      fireEvent.click(screen.getByRole('button', { name: 'Close static' }))

      advanceTimers(500)
      advanceTimers(800)

      expect(getScrollY()).toBe(150)
      expect(window.scrollTo).not.toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })

  it('opens from keyboard activation on delegated non-button triggers', async () => {
    render(
      <RevealPanel content={<p>Keyboard content</p>}>
        <RevealPanel.Top>
          <div data-trigger-collapse>Open panel</div>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <div />
        </RevealPanel.Bottom>
      </RevealPanel>,
    )

    const trigger = await screen.findByRole('button', { name: 'Open panel' })

    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(screen.getByText('Keyboard content')).toBeInTheDocument()
  })

  it('propagates nested close requests to parent panels', async () => {
    const user = userEvent.setup()

    render(
      <RevealPanel
        content={() => (
          <div>
            <RevealPanel
              content={({ close }) => (
                <button type="button" onClick={() => close({ propagate: true })}>
                  Close all
                </button>
              )}
            >
              <RevealPanel.Top>
                <button type="button" data-trigger-collapse>
                  Open inner
                </button>
              </RevealPanel.Top>
              <RevealPanel.Bottom>
                <div />
              </RevealPanel.Bottom>
            </RevealPanel>
          </div>
        )}
      >
        <RevealPanel.Top>
          <button type="button" data-trigger-collapse>
            Open outer
          </button>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <div />
        </RevealPanel.Bottom>
      </RevealPanel>,
    )

    await user.click(screen.getByRole('button', { name: 'Open outer' }))
    await user.click(screen.getByRole('button', { name: 'Open inner' }))
    expect(screen.getByRole('button', { name: 'Close all' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close all' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Close all' })).not.toBeInTheDocument()
    })
  })

  it('surfaces disabled state hooks and blocks interaction', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <RevealPanel disabled content={<p>Disabled content</p>}>
        <RevealPanel.Top>
          <RevealTrigger>Open disabled</RevealTrigger>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <div />
        </RevealPanel.Bottom>
      </RevealPanel>,
    )

    const trigger = screen.getByRole('button', { name: 'Open disabled' })
    const scope = container.querySelector('[data-reveal-scope]')

    expect(scope).toHaveAttribute('data-disabled', '')
    expect(trigger).toHaveAttribute('data-disabled', '')
    expect(trigger).toBeDisabled()

    await user.click(trigger)

    expect(screen.queryByText('Disabled content')).not.toBeInTheDocument()
  })

  it('binds the region label to the most recent explicit trigger', async () => {
    const user = userEvent.setup()

    render(
      <RevealPanel content={<p>Shared content</p>}>
        <RevealPanel.Top>
          <div>
            <RevealTrigger id="first-trigger">Open first</RevealTrigger>
            <RevealTrigger id="second-trigger">Open second</RevealTrigger>
          </div>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <div />
        </RevealPanel.Bottom>
      </RevealPanel>,
    )

    await user.click(screen.getByRole('button', { name: 'Open second' }))

    expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'second-trigger')
  })

  it('exposes closed, opening, open, and closing phases through render props and hooks', () => {
    jest.useFakeTimers()

    function PhaseProbe() {
      const { phase } = useRevealPanelState()
      return <p>Hook phase {phase}</p>
    }

    try {
      const { container } = render(
        <RevealPanel
          content={({ phase }) => (
            <div>
              <p>Render phase {phase}</p>
              <PhaseProbe />
              <RevealClose>Close phased</RevealClose>
            </div>
          )}
        >
          <RevealPanel.Top>
            <RevealTrigger>Open phased</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      const scope = container.querySelector('[data-reveal-scope]')
      const trigger = screen.getByRole('button', { name: 'Open phased' })

      expect(scope).toHaveAttribute('data-phase', 'closed')
      expect(trigger).toHaveAttribute('data-phase', 'closed')

      fireEvent.click(trigger)

      expect(scope).toHaveAttribute('data-phase', 'opening')
      expect(trigger).toHaveAttribute('data-phase', 'opening')
      expect(screen.getByText('Render phase opening')).toBeInTheDocument()
      expect(screen.getByText('Hook phase opening')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(401)
      })

      expect(scope).toHaveAttribute('data-phase', 'open')
      expect(trigger).toHaveAttribute('data-phase', 'open')
      expect(screen.getByText('Render phase open')).toBeInTheDocument()
      expect(screen.getByText('Hook phase open')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Close phased' }))

      expect(scope).toHaveAttribute('data-phase', 'closing')
      expect(trigger).toHaveAttribute('data-phase', 'closing')
      expect(screen.getByText('Render phase closing')).toBeInTheDocument()
      expect(screen.getByText('Hook phase closing')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(401)
      })

      expect(screen.queryByText('Render phase closing')).not.toBeInTheDocument()
      expect(screen.queryByText('Hook phase closing')).not.toBeInTheDocument()
      expect(scope).toHaveAttribute('data-phase', 'closed')
      expect(trigger).toHaveAttribute('data-phase', 'closed')
    } finally {
      jest.useRealTimers()
    }
  })

  it('keeps revealed content mounted through the closed phase when keepMounted is enabled', () => {
    jest.useFakeTimers()

    function PhaseProbe() {
      const { phase } = useRevealPanelState()
      return <p>Hook phase {phase}</p>
    }

    try {
      const { container } = render(
        <RevealPanel
          content={({ phase }) => (
            <div>
              <p>Render phase {phase}</p>
              <PhaseProbe />
              <RevealClose>Close kept</RevealClose>
            </div>
          )}
          keepMounted
        >
          <RevealPanel.Top>
            <RevealTrigger>Open kept</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      const scope = container.querySelector('[data-reveal-scope]')
      const region = container.querySelector('[role="region"]')

      expect(scope).toHaveAttribute('data-phase', 'closed')
      expect(region).toHaveAttribute('hidden')
      expect(screen.getByText('Render phase closed')).toBeInTheDocument()
      expect(screen.getByText('Hook phase closed')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Open kept' }))

      expect(region).not.toHaveAttribute('hidden')
      expect(screen.getByText('Render phase opening')).toBeInTheDocument()
      expect(screen.getByText('Hook phase opening')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(401)
      })

      expect(screen.getByText('Render phase open')).toBeInTheDocument()
      expect(screen.getByText('Hook phase open')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Close kept' }))

      expect(screen.getByText('Render phase closing')).toBeInTheDocument()
      expect(screen.getByText('Hook phase closing')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(401)
      })

      expect(scope).toHaveAttribute('data-phase', 'closed')
      expect(region).toHaveAttribute('hidden')
      expect(screen.getByText('Render phase closed')).toBeInTheDocument()
      expect(screen.getByText('Hook phase closed')).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })

  it('tracks phases independently for nested reveal panels', () => {
    jest.useFakeTimers()

    try {
      render(
        <RevealPanel
          content={({ phase: outerPhase }) => (
            <div>
              <p>Outer phase {outerPhase}</p>
              <RevealPanel
                content={({ phase: innerPhase }) => (
                  <div>
                    <p>Inner phase {innerPhase}</p>
                    <RevealClose>Close inner phased</RevealClose>
                  </div>
                )}
              >
                <RevealPanel.Top>
                  <RevealTrigger>Open inner phased</RevealTrigger>
                </RevealPanel.Top>
                <RevealPanel.Bottom>
                  <div />
                </RevealPanel.Bottom>
              </RevealPanel>
            </div>
          )}
        >
          <RevealPanel.Top>
            <RevealTrigger>Open outer phased</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Open outer phased' }))
      expect(screen.getByText('Outer phase opening')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(401)
      })

      expect(screen.getByText('Outer phase open')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Open inner phased' }))
      expect(screen.getByText('Inner phase opening')).toBeInTheDocument()
      expect(screen.getByText('Outer phase open')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(401)
      })

      expect(screen.getByText('Inner phase open')).toBeInTheDocument()
      expect(screen.getByText('Outer phase open')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Close inner phased' }))
      expect(screen.getByText('Inner phase closing')).toBeInTheDocument()
      expect(screen.getByText('Outer phase open')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(401)
      })

      expect(screen.queryByText('Inner phase closing')).not.toBeInTheDocument()
      expect(screen.getByText('Outer phase open')).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })

  it('still opens correctly when reduced motion is preferred', async () => {
    const user = userEvent.setup()
    setReducedMotionPreference(true)

    render(
      <RevealPanel magicMotion content={<p>Reduced motion content</p>}>
        <RevealPanel.Top>
          <RevealTrigger>Open reduced</RevealTrigger>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <div />
        </RevealPanel.Bottom>
      </RevealPanel>,
    )

    await user.click(screen.getByRole('button', { name: 'Open reduced' }))

    expect(screen.getByText('Reduced motion content')).toBeInTheDocument()
  })

  it('restores scroll without intermediate animated values when reduced motion is preferred', () => {
    jest.useFakeTimers()
    setReducedMotionPreference(true)

    try {
      const { getScrollY } = installWindowScrollState(150)
      const documentTop = 620
      const { container } = render(
        <RevealPanel
          scrollOnOpen
          restoreScrollOnClose
          content={
            <div>
              <p>Reduced motion scroll content</p>
              <RevealClose>Close reduced scroll</RevealClose>
            </div>
          }
        >
          <RevealPanel.Top>
            <RevealTrigger>Open reduced scroll</RevealTrigger>
          </RevealPanel.Top>
          <RevealPanel.Bottom>
            <div />
          </RevealPanel.Bottom>
        </RevealPanel>,
      )

      const scope = container.querySelector('[data-reveal-scope]')
      expect(scope).not.toBeNull()
      setElementRect(scope as Element, () => documentTop - getScrollY())

      fireEvent.click(screen.getByRole('button', { name: 'Open reduced scroll' }))

      advanceTimers(1200)

      fireEvent.click(screen.getByRole('button', { name: 'Close reduced scroll' }))

      advanceTimers(500)
      advanceTimers(800)

      expect(getScrollY()).toBe(150)
      expect(getScrollToTopCalls().every((top) => top === documentTop || top === 150)).toBe(true)
    } finally {
      jest.useRealTimers()
    }
  })

  it('exports only the supported public package surface', () => {
    expect(Object.keys(revealUi).sort()).toEqual([
      'RevealClose',
      'RevealGroup',
      'RevealPanel',
      'RevealTrigger',
      'useRevealPanelState',
    ])
  })
})
