# @mijengo/reveal-ui

`@mijengo/reveal-ui` is a React library for persistent-summary disclosure: inline reveal editors,
expanding card disclosure, and nested reveal flows where the summary stays visible while extra
content appears between persistent top and bottom regions.

It is intentionally not a generic draggable splitter. The public API centers `RevealPanel`, with
`RevealSplitter` kept as a deprecated compatibility alias for older codebases.

## Why this pattern exists

Most disclosure primitives toggle a trigger and a panel. `RevealPanel` preserves surrounding layout
context by keeping a top region and a bottom region mounted, then inserting revealed content between
them.

That makes it a good fit for:

- inline reveal editors
- stacked cards that expand without losing their summary
- nested edit flows that need close propagation
- grouped single-open disclosure stacks

## Installation

```bash
npm install @mijengo/reveal-ui motion react react-dom
```

Peer dependencies:

- `react@^19`
- `react-dom@^19`
- `motion@^12.34.5`

## Quick Start

```tsx
import { RevealClose, RevealPanel, RevealTrigger } from '@mijengo/reveal-ui'

export function AccountRevealCard() {
  return (
    <RevealPanel
      content={({ close, isOpen }) => (
        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-700">
            The summary stays mounted while the editor opens inline.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
              {isOpen ? 'editing' : 'collapsed'}
            </span>
            <RevealClose className="rounded-full border px-3 py-1.5 text-sm text-slate-700">
              Done
            </RevealClose>
          </div>
        </div>
      )}
      magicMotion
      scrollOnOpen
    >
      <RevealPanel.Top>
        <div className="rounded-t-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Account</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">Operating profile</h2>
              <p className="mt-1 text-sm text-slate-600">
                Persistent summary disclosure for inline editing.
              </p>
            </div>
            <RevealTrigger className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
              Edit
            </RevealTrigger>
          </div>
        </div>
      </RevealPanel.Top>

      <RevealPanel.Bottom>
        <div className="rounded-b-3xl border border-t-0 border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Footer actions, metrics, or hints can remain visible below the revealed content.
        </div>
      </RevealPanel.Bottom>
    </RevealPanel>
  )
}
```

## Public API

### Components

- `RevealPanel`: primary persistent-summary disclosure primitive
- `RevealGroup`: coordinates sibling exclusivity for accordion-like stacks
- `RevealTrigger`: explicit trigger component with proper `aria-expanded` and `aria-controls`
- `RevealClose`: explicit close component that restores focus to the last trigger by default
- `RevealSplitter`: deprecated alias for `RevealPanel`

### Props and behaviors

- `content`: primary prop for revealed content
- `revealContent`: deprecated compatibility alias for `content`
- Controlled and uncontrolled open state are both supported via `open`, `defaultOpen`, and
  `onOpenChange`
- `closeSiblings` integrates with `RevealGroup` for single-open stacks
- `close({ propagate: true })` lets nested children collapse outer panels
- `scrollOnOpen`, `scrollContainer`, and `scrollCascade` coordinate scroll alignment
- `magicMotion`, `parallaxOffset`, and `revealBlurPx` enable motion-enhanced transitions
- `restoreFocusOnClose` keeps keyboard users oriented after close

### Composition model

Use `RevealPanel.Top` and `RevealPanel.Bottom` to mark the persistent regions. The revealed content
is inserted between them. This top/content/bottom composition model is the point of the component;
it is not simplified away in the standalone package.

## Accessibility

- Delegated trigger attributes (`data-trigger-collapse` and `data-trigger-restore`) receive
  `aria-expanded`, `aria-controls`, focusability, and `role="button"` when needed
- `RevealTrigger` and `RevealClose` expose `data-state` and `data-disabled`
- The revealed region uses `role="region"` and binds to the active trigger ID when available
- Closing restores focus to the last trigger unless disabled through `restoreFocusOnClose` or
  `close({ restoreFocus: false })`
- Reduced-motion environments are respected for motion and scroll timing

## Motion and Scroll

`magicMotion` layers `motion/react` layout transitions over the base disclosure behavior. When
combined with `scrollOnOpen`, the panel can align itself inside one container and optionally nudge
outer containers through `scrollCascade`.

If your layout does not need motion, leave `magicMotion` off and the component still behaves as a
plain persistent-summary disclosure.

## Migration From `RevealSplitter`

Existing imports continue to work:

```tsx
import { RevealSplitter } from '@mijengo/reveal-ui'
```

For new code, prefer:

```tsx
import { RevealPanel } from '@mijengo/reveal-ui'
```

`RevealSplitter` is the same component, kept only for migration compatibility.

## Local Example

A small Next.js consumer lives in `examples/next-app`.

```bash
cd examples/next-app
npm install
npm run dev
```

## Validation

From a clean checkout:

```bash
npm install
npm run lint
npm run test
npm run typecheck
npm run build
npm run pack:dry-run
npm run smoke
```

## License

MIT
