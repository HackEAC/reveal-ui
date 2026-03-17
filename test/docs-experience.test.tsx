import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocsExperience } from '../examples/next-app/components/site/docs-experience'

jest.mock('@/components/ui/badge', () => {
  const React = require('react')

  return {
    Badge: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      React.createElement('div', { className, ...props }, children),
  }
})

jest.mock('@/components/ui/card', () => {
  const React = require('react')

  const makeComponent = (tagName: 'div' | 'h3' | 'p') =>
    React.forwardRef(function MockComponent(
      {
        children,
        className,
        ...props
      }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode },
      ref: React.ForwardedRef<HTMLElement>,
    ) {
      return React.createElement(tagName, { className, ...props, ref }, children)
    })

  return {
    Card: makeComponent('div'),
    CardContent: makeComponent('div'),
    CardDescription: makeComponent('p'),
    CardHeader: makeComponent('div'),
    CardTitle: makeComponent('h3'),
  }
})

jest.mock('@/components/ui/separator', () => {
  const React = require('react')

  return {
    Separator: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', { className, role: 'separator', ...props }),
  }
})

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: Array<string | false | null | undefined>) => inputs.filter(Boolean).join(' '),
}))

describe('DocsExperience', () => {
  it('renders the human-first docs shell by default', () => {
    render(<DocsExperience />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Developer docs that read like a real reference surface',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Use it when the current workflow should stay in view',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Quick context for an AI agent')).not.toBeInTheDocument()
    expect(screen.queryByText('Drop-in starting point')).not.toBeInTheDocument()
  })

  it('switches between docs pages and updates the active content', async () => {
    const user = userEvent.setup()

    render(<DocsExperience />)

    await user.click(
      screen.getByRole('button', {
        name: /API Component exports and every RevealPanel prop group\./i,
      }),
    )

    expect(
      await screen.findByRole('heading', { level: 3, name: 'Component exports' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'RevealPanel control and composition props' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Scroll and motion props' }),
    ).toBeInTheDocument()
  })

  it('uses the page jump buttons to scroll to docs sections', async () => {
    const user = userEvent.setup()
    const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView')

    render(<DocsExperience />)

    await user.click(screen.getByRole('button', { name: 'Quick start' }))

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })
})
