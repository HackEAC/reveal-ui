import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { RevealClose, RevealGroup, RevealPanel, RevealSplitter, RevealTrigger } from '../src'
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
