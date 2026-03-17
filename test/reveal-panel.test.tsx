import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  RevealClose,
  RevealGroup,
  RevealPanel,
  RevealSplitter,
  RevealTrigger,
  useRevealPanelState,
} from '../src'
import { setReducedMotionPreference } from './match-media'

describe('RevealPanel', () => {
  it('reveals and restores content through delegated trigger attributes', async () => {
    const user = userEvent.setup()

    render(
      <RevealSplitter
        revealContent={
          <div>
            <p>Revealed content</p>
            <button type="button" data-trigger-restore>
              Close
            </button>
          </div>
        }
      >
        <RevealSplitter.Top>
          <button type="button" data-trigger-collapse>
            Open
          </button>
        </RevealSplitter.Top>
        <RevealSplitter.Bottom>
          <p>Bottom</p>
        </RevealSplitter.Bottom>
      </RevealSplitter>,
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
        <RevealSplitter content={<p>First panel</p>}>
          <RevealSplitter.Top>
            <button type="button" data-trigger-collapse>
              Open first
            </button>
          </RevealSplitter.Top>
          <RevealSplitter.Bottom>
            <div />
          </RevealSplitter.Bottom>
        </RevealSplitter>

        <RevealSplitter content={<p>Second panel</p>}>
          <RevealSplitter.Top>
            <button type="button" data-trigger-collapse>
              Open second
            </button>
          </RevealSplitter.Top>
          <RevealSplitter.Bottom>
            <div />
          </RevealSplitter.Bottom>
        </RevealSplitter>
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

  it('opens from keyboard activation on delegated non-button triggers', async () => {
    render(
      <RevealSplitter content={<p>Keyboard content</p>}>
        <RevealSplitter.Top>
          <div data-trigger-collapse>Open panel</div>
        </RevealSplitter.Top>
        <RevealSplitter.Bottom>
          <div />
        </RevealSplitter.Bottom>
      </RevealSplitter>,
    )

    const trigger = await screen.findByRole('button', { name: 'Open panel' })

    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(screen.getByText('Keyboard content')).toBeInTheDocument()
  })

  it('propagates nested close requests to parent panels', async () => {
    const user = userEvent.setup()

    render(
      <RevealSplitter
        content={() => (
          <div>
            <RevealSplitter
              content={({ close }) => (
                <button type="button" onClick={() => close({ propagate: true })}>
                  Close all
                </button>
              )}
            >
              <RevealSplitter.Top>
                <button type="button" data-trigger-collapse>
                  Open inner
                </button>
              </RevealSplitter.Top>
              <RevealSplitter.Bottom>
                <div />
              </RevealSplitter.Bottom>
            </RevealSplitter>
          </div>
        )}
      >
        <RevealSplitter.Top>
          <button type="button" data-trigger-collapse>
            Open outer
          </button>
        </RevealSplitter.Top>
        <RevealSplitter.Bottom>
          <div />
        </RevealSplitter.Bottom>
      </RevealSplitter>,
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

  it('preserves RevealSplitter as the RevealPanel compatibility alias', () => {
    expect(RevealSplitter).toBe(RevealPanel)
  })
})
