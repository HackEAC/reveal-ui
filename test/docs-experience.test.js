const React = require('react')
const { render, screen } = require('@testing-library/react')
const userEvent = require('@testing-library/user-event').default

jest.mock('@/components/ui/badge', () => {
  return {
    Badge: ({ children, className, ...props }) =>
      React.createElement('div', { className, ...props }, children),
  }
})

jest.mock('@/components/ui/card', () => {
  const makeComponent = (tagName) =>
    React.forwardRef(function MockComponent({ children, className, ...props }, ref) {
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
  return {
    Separator: ({ className, ...props }) =>
      React.createElement('div', { className, role: 'separator', ...props }),
  }
})

jest.mock('@/lib/utils', () => ({
  cn: (...inputs) => inputs.filter(Boolean).join(' '),
}))

const { DocsExperience } = require('../examples/next-app/components/site/docs-experience')

describe('DocsExperience', () => {
  it('renders the human-first docs shell by default', () => {
    render(React.createElement(DocsExperience))

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

    render(React.createElement(DocsExperience))

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

    render(React.createElement(DocsExperience))

    await user.click(screen.getByRole('button', { name: 'Quick start' }))

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })
})
