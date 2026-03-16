import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import type { ForwardedRef, ReactNode } from 'react'
import { installMatchMedia, resetReducedMotionPreference } from './match-media'

jest.mock('motion/react', () => {
  const React = require('react')

  const makeMotionTag = (tagName: string) =>
    React.forwardRef(function MockMotionTag(
      {
        animate,
        children,
        exit,
        initial,
        layout,
        transition,
        ...props
      }: {
        animate?: unknown
        children?: ReactNode
        exit?: unknown
        initial?: unknown
        layout?: unknown
        transition?: unknown
        [key: string]: unknown
      },
      ref: ForwardedRef<HTMLElement>,
    ) {
      return React.createElement(tagName, { ...props, ref }, children)
    })

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    LayoutGroup: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: {
      div: makeMotionTag('div'),
    },
  }
})

beforeAll(() => {
  installMatchMedia()
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0),
    writable: true,
  })
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: (handle: number) => clearTimeout(handle),
    writable: true,
  })
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: jest.fn(),
    writable: true,
  })
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: jest.fn(),
    writable: true,
  })
})

beforeEach(() => {
  resetReducedMotionPreference()
  jest.clearAllMocks()
})

afterEach(() => {
  cleanup()
})
