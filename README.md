<p align="center">
  <img
    alt="reveal-ui logo"
    src="https://raw.githubusercontent.com/HackEAC/reveal-ui/main/assets/logo/reveal-ui-mark.png"
    width="92"
  />
</p>

<h1 align="center">reveal-ui</h1>

<p align="center">
  Accessible React primitives for revealing rich content between a persistent header and footer.
</p>

<p align="center">
  <a href="https://hackeac.github.io/reveal-ui/docs">Docs</a>
  ·
  <a href="https://hackeac.github.io/reveal-ui/examples">Examples</a>
  ·
  <a href="https://github.com/HackEAC/reveal-ui">GitHub</a>
</p>

Use `reveal-ui` for inline editors, expanding cards, comparison flows, and nested tasks where the surrounding context should remain visible.

## Install

```bash
npm install reveal-ui motion react react-dom
```

Requires React `^19.0.0` and Motion `^12.40.0`.

## Quick start

```tsx
import { RevealClose, RevealPanel, RevealTrigger } from 'reveal-ui'

export function ProfileCard() {
  return (
    <RevealPanel
      content={
        <div>
          <label>
            Display name
            <input name="displayName" />
          </label>
          <RevealClose>Done</RevealClose>
        </div>
      }
    >
      <RevealPanel.Top>
        <h2>Profile</h2>
        <RevealTrigger>Edit</RevealTrigger>
      </RevealPanel.Top>

      <RevealPanel.Bottom>
        <p>Your public account details.</p>
      </RevealPanel.Bottom>
    </RevealPanel>
  )
}
```

`RevealPanel.Top` and `RevealPanel.Bottom` stay mounted. The `content` section opens between them and unmounts after its closing transition.

## Errors and async closing

`onClose` can return a promise. The panel waits for it before closing, ignores repeated close requests while it is pending, and stays open if it rejects. Rejections are normalized and displayed as panel errors.

```tsx
import * as React from 'react'
import { RevealClose, RevealPanel, RevealTrigger } from 'reveal-ui'

export function ProfileEditor() {
  const [name, setName] = React.useState('Ada')

  return (
    <RevealPanel
      onClose={async () => {
        const response = await fetch('/api/profile', {
          method: 'POST',
          body: JSON.stringify({ name }),
        })

        if (!response.ok) {
          throw new Error('Could not save the profile.')
        }
      }}
      onError={(error) => console.error(error)}
      content={({ clearError }) => (
        <div>
          <label>
            Display name
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                clearError()
              }}
            />
          </label>
          <RevealClose>Save</RevealClose>
        </div>
      )}
    >
      <RevealPanel.Top>
        <h2>{name}</h2>
        <RevealTrigger>Edit</RevealTrigger>
      </RevealPanel.Top>
      <RevealPanel.Bottom>Profile settings</RevealPanel.Bottom>
    </RevealPanel>
  )
}
```

For failures outside `onClose`, call `reportError(value)` from the content render props or `useRevealPanelState()`. Call `clearError()` to dismiss the current error.

An active error:

- keeps the panel open;
- renders a `role="alert"` banner in the revealed content;
- displays a decorative error badge in the header;
- adds `data-error` to the panel regions and controls;
- clears when the panel closes successfully.

Strings, `Error` instances, and objects with a string `message` or `error` field are supported. Structured errors preserve `title`, `code`, and `cause` when provided.

```ts
type RevealError = {
  message: string
  title?: string
  code?: string | number
  cause?: unknown
}
```

Pass `error` and `onErrorChange` to control the error from outside the panel.

## Controlled state

```tsx
const [open, setOpen] = React.useState(false)
const [error, setError] = React.useState<RevealError | null>(null)

<RevealPanel
  open={open}
  onOpenChange={setOpen}
  error={error}
  onErrorChange={setError}
  content={<Editor />}
>
  <RevealPanel.Top>
    <RevealTrigger>Edit</RevealTrigger>
  </RevealPanel.Top>
  <RevealPanel.Bottom>Summary</RevealPanel.Bottom>
</RevealPanel>
```

Errors clear only after the resolved open state changes to closed. If a controlled parent ignores `onOpenChange(false)`, the panel remains open and keeps its error.

## Groups and nested panels

Wrap sibling panels in `RevealGroup` to close the others when one opens:

```tsx
<RevealGroup>
  <RevealPanel content={<FirstDetails />}>...</RevealPanel>
  <RevealPanel content={<SecondDetails />}>...</RevealPanel>
</RevealGroup>
```

If a sibling has an async `onClose`, it remains open until that callback resolves.

Inside a nested panel, use `close({ propagate: true })` to close the current panel and its parent after a successful close.

## Reading panel state

The `content` render function and `useRevealPanelState()` share the same core state and actions:

```tsx
function PanelStatus() {
  const { phase, hasError } = useRevealPanelState()

  return <p>{hasError ? 'Action failed' : `Panel is ${phase}`}</p>
}
```

`useRevealPanelState()` must be called below a `RevealPanel`.

## API

### Exports

| Export | Purpose |
| --- | --- |
| `RevealPanel` | Main disclosure primitive |
| `RevealGroup` | Coordinates sibling panels |
| `RevealTrigger` | Opens its nearest panel |
| `RevealClose` | Closes its nearest panel |
| `useRevealPanelState()` | Reads panel state and actions |
| `CloseOptions` | Options accepted by `close()` |
| `RevealError` | Normalized panel error |
| `RevealPanelProps` | Props for `RevealPanel` |
| `RevealPanelState` | Value returned by the state hook |
| `RevealPhase` | `'closed' \| 'opening' \| 'open' \| 'closing'` |
| `RevealRenderProps` | Value passed to a content render function |
| `RevealContentProp` | Accepted shape of the `content` prop |
| `RevealTriggerProps` | Props accepted by trigger and close controls |

`RevealPanel` also exposes `Top`, `Bottom`, `Trigger`, and `Close` as static composition helpers. `RevealPanel.Trigger` and `RevealPanel.Close` are aliases for the standalone controls.

### RevealPanel props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Persistent top and bottom regions |
| `content` | `ReactNode \| (state) => ReactNode` | — | Content revealed between the regions |
| `revealContent` | Same as `content` | — | Deprecated alias for `content` |
| `className` | `string` | — | Class name for the panel scope |
| `keepMounted` | `boolean` | `false` | Keeps closed content mounted and hidden |
| `defaultOpen` | `boolean` | `false` | Initial uncontrolled open state |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Receives open-state requests |
| `onClose` | `(options?: CloseOptions) => void \| Promise<void>` | — | Runs before closing; rejection becomes a panel error |
| `disabled` | `boolean` | `false` | Disables panel controls |
| `error` | `RevealError \| Error \| string \| null` | — | Controlled error state |
| `onErrorChange` | `(error: RevealError \| null) => void` | — | Receives normalized error changes |
| `onError` | `(error: RevealError) => void \| Promise<void>` | — | Runs whenever an error is reported |
| `restoreFocusOnClose` | `boolean` | `true` | Returns focus to the last trigger after closing |
| `regionLabel` | `string` | `'Revealed content'` | Fallback accessible name for the content region |
| `closeSiblings` | `boolean` | Group default | Overrides sibling-closing behavior |
| `containTriggers` | `boolean` | `true` | Prevents delegated controls from affecting nested panels |
| `triggerAttr` | `string` | `'data-trigger-collapse'` | Attribute used by delegated open controls |
| `restoreAttr` | `string` | `'data-trigger-restore'` | Attribute used by delegated close controls |
| `autoSplit` | `boolean` | `false` | Infers top and bottom from unmarked children |
| `scrollOnOpen` | `boolean` | `false` | Scrolls the panel into view when opened |
| `restoreScrollOnClose` | `boolean` | `false` | Restores the captured scroll position after closing |
| `scrollContainer` | `HTMLElement \| null \| (() => HTMLElement \| null)` | Nearest scroller | Sets the primary scroll target |
| `scrollCascade` | `Array<{ container; offset?; mode?; padding? }>` | `[]` | Coordinates additional scroll containers |
| `scrollOffset` | `number` | `0` | Offset from the scroll target's top edge |
| `scrollDurationMs` | `number` | `450` | Scroll animation duration |
| `scrollSpacerTarget` | `'self' \| 'container' \| 'none'` | `'self'` | Chooses where temporary scroll space is added |
| `scrollOvershootPx` | `number` | `12` | Overshoot used during animated alignment |
| `magicMotion` | `boolean` | `false` | Enables layout and parallax transitions |
| `parallaxOffset` | `number` | `10` | Top and bottom translation distance |
| `revealBlurPx` | `number` | `6` | Content blur during transitions |

### Render props and hook state

| Field | Type | Description |
| --- | --- | --- |
| `isOpen` | `boolean` | Resolved open state |
| `phase` | `RevealPhase` | Current transition phase |
| `disabled` | `boolean` | Whether panel controls are disabled; hook only |
| `contentId` | `string` | Stable ID for the content region |
| `triggerId` | `string \| undefined` | ID of the active trigger |
| `open()` | `() => void` | Opens the panel |
| `close(options?)` | `(options?: CloseOptions) => void` | Requests a close |
| `error` | `RevealError \| null` | Current normalized error |
| `hasError` | `boolean` | Whether an error is active |
| `reportError(value)` | `(value: unknown) => void` | Reports and displays an error |
| `clearError()` | `() => void` | Clears the error |

`close()` accepts `{ restoreFocus?: boolean, propagate?: boolean }`.

`RevealTrigger` and `RevealClose` accept standard button props plus `asChild`. With `asChild`, props and behavior are merged into the child element through Radix Slot.

`RevealGroup` accepts `children` and an optional `closeSiblings` boolean, which defaults to `true`.

## Accessibility and styling

- Triggers receive `aria-expanded` and `aria-controls`.
- Revealed content uses `role="region"` and is labelled by its active trigger when possible.
- Error messages use `role="alert"`; the header badge is hidden from assistive technology.
- Focus returns to the last trigger by default.
- Reduced-motion preferences disable or simplify motion and scrolling.
- Delegated non-button controls receive button semantics and keyboard support.

Use the state attributes to style any panel state:

```css
[data-reveal-scope][data-state='open'] { /* open panel */ }
[data-reveal-scope][data-phase='closing'] { /* closing panel */ }
[data-reveal-scope][data-error] { /* error panel */ }
[data-reveal-scope][data-disabled] { /* disabled panel */ }
```

The scope, top region, revealed content, bottom region, and controls expose the relevant `data-state`, `data-phase`, `data-error`, and `data-disabled` attributes.

## Migrating from prereleases

`RevealSplitter` was removed. Replace it with `RevealPanel`:

```diff
- import { RevealSplitter } from 'reveal-ui'
+ import { RevealPanel } from 'reveal-ui'
```

## Development

```bash
npm install
npm run ci
npm run docs:preview
```

## License

MIT
