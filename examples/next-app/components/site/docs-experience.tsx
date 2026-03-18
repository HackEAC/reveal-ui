'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const quickStartSnippet = `import * as React from 'react'
import {
  RevealClose,
  RevealPanel,
  RevealTrigger,
  useRevealPanelState,
} from 'reveal-ui'

export function AccountRevealCard() {
  return (
    <RevealPanel
      keepMounted
      magicMotion
      restoreScrollOnClose
      scrollOnOpen
      content={({ phase }) => (
        <div className="border-t border-slate-200 px-5 py-4">
          <StatusInline phase={phase} />
          <RevealClose className="mt-4 rounded-md border px-3 py-2 text-sm">
            Done
          </RevealClose>
        </div>
      )}
    >
      <RevealPanel.Top>
        <div className="rounded-t-3xl border border-slate-200 bg-white px-5 py-4">
          <RevealTrigger className="rounded-md bg-slate-950 px-4 py-2 text-sm text-white">
            Edit inline
          </RevealTrigger>
        </div>
      </RevealPanel.Top>

      <RevealPanel.Bottom>
        <div className="rounded-b-3xl border border-t-0 border-slate-200 bg-slate-50 px-5 py-4 text-sm">
          Footer actions stay visible below the reveal.
        </div>
      </RevealPanel.Bottom>
    </RevealPanel>
  )
}

function StatusInline({ phase }: { phase: string }) {
  const panel = useRevealPanelState()
  return <p className="text-sm text-slate-700">Panel phase: {panel.phase ?? phase}</p>
}`

const importSnippet = `import {
  RevealClose,
  RevealGroup,
  RevealPanel,
  RevealTrigger,
  useRevealPanelState,
} from 'reveal-ui'`

const stateSnippet = `function PrefetchPreview() {
  const { phase } = useRevealPanelState()

  React.useEffect(() => {
    if (phase !== 'opening' && phase !== 'open') return
    const controller = new AbortController()
    fetch('/api/preview', { signal: controller.signal })
    return () => controller.abort()
  }, [phase])

  return null
}`

const controlledSnippet = `function InlineStack() {
  const [open, setOpen] = React.useState(false)

  return (
    <RevealGroup closeSiblings>
      <RevealPanel open={open} onOpenChange={setOpen} content={<InlineDetails />}>
        <RevealPanel.Top>
          <RevealTrigger>Inspect</RevealTrigger>
        </RevealPanel.Top>
        <RevealPanel.Bottom>
          <FooterSummary />
        </RevealPanel.Bottom>
      </RevealPanel>
    </RevealGroup>
  )
}`

const upgradeSnippet = `// Before
import { RevealSplitter } from 'reveal-ui'

// After
import { RevealPanel } from 'reveal-ui'`

const validationSnippet = `npm install
npm run lint
npm run test
npm run test:coverage
npm run typecheck
npm run build
npm run pack:dry-run
npm run smoke`

const previewSnippet = `npm run docs:install
npm run docs:preview`

const installCommands = [
  {
    command: 'pnpm add reveal-ui motion react react-dom',
    label: 'pnpm',
    note: 'Best fit for workspaces and monorepos.',
  },
  {
    command: 'npm install reveal-ui motion react react-dom',
    label: 'npm',
    note: 'The default install path for npm projects.',
  },
  {
    command: 'yarn add reveal-ui motion react react-dom',
    label: 'yarn',
    note: 'Use this when the app already runs on Yarn.',
  },
  {
    command: 'bun add reveal-ui motion react react-dom',
    label: 'bun',
    note: 'Lean path for Bun-first applications.',
  },
] as const

const docsPages = [
  {
    description: 'What the primitive is for and when it earns its place.',
    id: 'overview',
    label: 'Overview',
    sections: [
      { id: 'problem-fit', label: 'Problem fit' },
      { id: 'mental-model', label: 'Mental model' },
      { id: 'quick-start', label: 'Quick start' },
    ],
  },
  {
    description: 'Packages, peer dependencies, and import surface.',
    id: 'installation',
    label: 'Installation',
    sections: [
      { id: 'install-commands', label: 'Install commands' },
      { id: 'peer-dependencies', label: 'Peer dependencies' },
      { id: 'imports', label: 'Imports and preview' },
    ],
  },
  {
    description: 'Top, content, bottom composition and hook access.',
    id: 'composition',
    label: 'Composition',
    sections: [
      { id: 'anatomy', label: 'Anatomy' },
      { id: 'render-props', label: 'Render props' },
      { id: 'panel-state', label: 'Panel state hook' },
    ],
  },
  {
    description: 'Component exports and every RevealPanel prop group.',
    id: 'api',
    label: 'API',
    sections: [
      { id: 'components', label: 'Components' },
      { id: 'panel-control', label: 'Panel control props' },
      { id: 'scroll-and-motion', label: 'Scroll and motion props' },
    ],
  },
  {
    description: 'Lifecycle phases, nested close propagation, and groups.',
    id: 'behavior',
    label: 'Behavior',
    sections: [
      { id: 'lifecycle', label: 'Lifecycle phases' },
      { id: 'close-options', label: 'Close options' },
      { id: 'group-behavior', label: 'Groups and nesting' },
    ],
  },
  {
    description: 'Semantics, focus management, and reduced-motion support.',
    id: 'accessibility',
    label: 'Accessibility',
    sections: [
      { id: 'semantics', label: 'Semantics' },
      { id: 'delegated-triggers', label: 'Delegated triggers' },
      { id: 'focus-and-motion', label: 'Focus and motion' },
    ],
  },
  {
    description: 'Upgrade notes, repository checks, and local example preview.',
    id: 'migration',
    label: 'Validation',
    sections: [
      { id: 'upgrade', label: 'Upgrade import' },
      { id: 'validation', label: 'Validation' },
      { id: 'local-example', label: 'Local example' },
    ],
  },
] as const

type DocsPageId = (typeof docsPages)[number]['id']

type DocsTableColumn = {
  className?: string
  key: string
  label: string
}

type DocsTableRow = Record<string, React.ReactNode>

const componentRows: DocsTableRow[] = [
  {
    component: '`RevealPanel`',
    notes: 'Primary persistent-summary disclosure primitive.',
    purpose: 'Keeps top and bottom regions mounted and inserts revealed content between them.',
  },
  {
    component: '`RevealGroup`',
    notes: 'Defaults `closeSiblings` to `true`.',
    purpose: 'Coordinates sibling exclusivity for accordion-like or chooser-like stacks.',
  },
  {
    component: '`RevealTrigger`',
    notes: '`asChild` is supported.',
    purpose: 'Explicit trigger with `aria-expanded`, `aria-controls`, and data attributes.',
  },
  {
    component: '`RevealClose`',
    notes: 'Restores focus to the last trigger by default.',
    purpose: 'Explicit close action for any point inside a panel subtree.',
  },
  {
    component: '`useRevealPanelState()`',
    notes: 'Works anywhere inside a `RevealPanel` subtree.',
    purpose: 'Exposes `phase`, `isOpen`, `open`, `close`, and IDs without prop drilling.',
  },
] as const

const controlPropRows: DocsTableRow[] = [
  {
    details:
      'Node or render function receiving `open`, `close`, `isOpen`, `phase`, `contentId`, and `triggerId`.',
    prop: '`content`',
    type: '`ReactNode | (renderProps) => ReactNode`',
  },
  {
    details: 'Deprecated alias for `content`.',
    prop: '`revealContent`',
    type: '`ReactNode | (renderProps) => ReactNode`',
  },
  {
    details:
      'Keeps the revealed subtree mounted through `closed` so lifecycle-aware children can animate or retain local state.',
    prop: '`keepMounted`',
    type: '`boolean`',
  },
  {
    details: 'Initial open state for uncontrolled usage.',
    prop: '`defaultOpen`',
    type: '`boolean`',
  },
  {
    details: 'Controlled open state.',
    prop: '`open`',
    type: '`boolean`',
  },
  {
    details: 'Change handler for controlled usage.',
    prop: '`onOpenChange`',
    type: '`(open: boolean) => void`',
  },
  {
    details: 'Disables opening and closing interactions for the panel.',
    prop: '`disabled`',
    type: '`boolean`',
  },
  {
    details: 'Marks delegated trigger nodes that should behave like panel triggers.',
    prop: '`triggerAttr`',
    type: '`string`',
  },
  {
    details: 'Marks delegated restore nodes that should behave like close controls.',
    prop: '`restoreAttr`',
    type: '`string`',
  },
  {
    details:
      'Automatically splits children into top and bottom regions when the component can infer the boundary.',
    prop: '`autoSplit`',
    type: '`boolean`',
  },
  {
    details:
      'Closes sibling panels when this panel opens, using the nearest `RevealGroup` when present.',
    prop: '`closeSiblings`',
    type: '`boolean`',
  },
  {
    details:
      'Keeps delegated triggers scoped to the current panel instead of bubbling through nested panels.',
    prop: '`containTriggers`',
    type: '`boolean`',
  },
  {
    details: 'Controls whether focus returns to the last trigger after close.',
    prop: '`restoreFocusOnClose`',
    type: '`boolean`',
  },
  {
    details: 'Labels the revealed region for assistive technologies.',
    prop: '`regionLabel`',
    type: '`string`',
  },
] as const

const motionPropRows: DocsTableRow[] = [
  {
    details: 'Scrolls the panel into view when it opens.',
    prop: '`scrollOnOpen`',
    type: '`boolean`',
  },
  {
    details: 'Restores the primary scroll target captured during open as the panel starts closing.',
    prop: '`restoreScrollOnClose`',
    type: '`boolean`',
  },
  {
    details: 'Element or resolver used as the primary scroll target.',
    prop: '`scrollContainer`',
    type: '`HTMLElement | null | () => HTMLElement | null`',
  },
  {
    details:
      'Optional outer containers to align or ensure-visible after the primary scroll container settles on open.',
    prop: '`scrollCascade`',
    type: '`Array<{ container; offset?; mode?; padding? }>`',
  },
  {
    details: 'Top offset used during automatic scroll alignment.',
    prop: '`scrollOffset`',
    type: '`number`',
  },
  {
    details: 'Scroll animation timing in milliseconds.',
    prop: '`scrollDurationMs`',
    type: '`number`',
  },
  {
    details: 'Enables motion-enhanced layout transitions with `motion/react`.',
    prop: '`magicMotion`',
    type: '`boolean`',
  },
  {
    details: 'Controls the reveal translation depth used by motion.',
    prop: '`parallaxOffset`',
    type: '`number`',
  },
  {
    details: 'Applies blur during reveal transitions when motion is enabled.',
    prop: '`revealBlurPx`',
    type: '`number`',
  },
  {
    details: 'Adds overshoot distance during automatic scroll alignment.',
    prop: '`scrollOvershootPx`',
    type: '`number`',
  },
  {
    details: 'Chooses whether scroll spacers attach to the panel, the container, or not at all.',
    prop: '`scrollSpacerTarget`',
    type: "`'self' | 'container' | 'none'`",
  },
] as const

const renderPropRows: DocsTableRow[] = [
  {
    details: 'Opens the panel from inside the revealed subtree.',
    field: '`open()`',
    value: 'Function',
  },
  {
    details:
      'Closes the panel and optionally propagates to outer panels or suppresses focus restore.',
    field: '`close(options?)`',
    value: 'Function',
  },
  {
    details: 'Current boolean open state.',
    field: '`isOpen`',
    value: '`boolean`',
  },
  {
    details: 'Lifecycle phase: `closed`, `opening`, `open`, or `closing`.',
    field: '`phase`',
    value: '`RevealPhase`',
  },
  {
    details: 'Stable ID for the revealed region.',
    field: '`contentId`',
    value: '`string`',
  },
  {
    details: 'Stable ID for the active trigger when one exists.',
    field: '`triggerId`',
    value: '`string | undefined`',
  },
] as const

const phaseRows: DocsTableRow[] = [
  {
    phase: '`closed`',
    timing:
      'The panel is not visible. With `keepMounted`, the subtree still exists and can render a dormant state.',
    use: 'Good for cleanup, inert styling, and preserved local state.',
  },
  {
    phase: '`opening`',
    timing: 'The panel has started to reveal but has not settled yet.',
    use: 'Good for starting fetches, choreography, and scroll-linked work.',
  },
  {
    phase: '`open`',
    timing: 'The panel is fully open.',
    use: 'Good for stable controls, focus-dependent behavior, and fully expanded layouts.',
  },
  {
    phase: '`closing`',
    timing: 'The panel is still mounted while closing work runs.',
    use: 'Good for exit motion, deferred teardown, and restoring surrounding emphasis.',
  },
] as const

const closeOptionRows: DocsTableRow[] = [
  {
    details: 'When `true`, the close request bubbles to outer panels in the reveal hierarchy.',
    option: '`propagate`',
    type: '`boolean`',
  },
  {
    details: 'When `false`, the panel closes without returning focus to the last trigger.',
    option: '`restoreFocus`',
    type: '`boolean`',
  },
] as const

const accessibilityRows: DocsTableRow[] = [
  {
    details:
      'The revealed container uses `role="region"` and binds to the trigger ID when one is available.',
    area: 'Region semantics',
  },
  {
    details:
      '`RevealTrigger` and `RevealClose` expose `data-state`, `data-phase`, and `data-disabled` for styling and inspection.',
    area: 'State data attributes',
  },
  {
    details:
      'Delegated triggers receive button semantics, focusability, and the correct ARIA wiring when they are not naturally interactive.',
    area: 'Delegated controls',
  },
  {
    details:
      'Closing restores focus to the last trigger unless disabled on the panel or the specific close call.',
    area: 'Focus return',
  },
  {
    details: 'Reduced-motion environments are respected for motion and coordinated scroll timing.',
    area: 'Reduced motion',
  },
] as const

const peerRows: DocsTableRow[] = [
  {
    note: 'Required peer dependency.',
    package: '`react`',
    version: '`^19`',
  },
  {
    note: 'Required peer dependency.',
    package: '`react-dom`',
    version: '`^19`',
  },
  {
    note: 'Used when `magicMotion` is enabled.',
    package: '`motion`',
    version: '`^12.34.5`',
  },
] as const

const pageFacts: Record<DocsPageId, string[]> = {
  accessibility: ['role region', 'focus restore', 'reduced motion'],
  api: ['RevealPanel', 'RevealGroup', 'trigger helpers'],
  behavior: ['phase-aware', 'close propagate', 'single-open groups'],
  composition: ['top / content / bottom', 'render props', 'state hook'],
  installation: ['react 19', 'motion peer', 'Next example'],
  migration: ['upgrade import', 'validation', 'docs preview'],
  overview: ['persistent-summary disclosure', 'inline reveal', 'nested flows'],
}

function getDocsPage(pageId: DocsPageId) {
  return docsPages.find((page) => page.id === pageId) ?? docsPages[0]
}

function DocsTable({ columns, rows }: { columns: DocsTableColumn[]; rows: DocsTableRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border/25 bg-background/90">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-border/30 bg-secondary/50">
              {columns.map((column) => (
                <th
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-foreground',
                    column.className,
                  )}
                  key={column.key}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="border-b border-border/20 last:border-b-0"
                key={String(row[columns[0].key])}
              >
                {columns.map((column) => (
                  <td
                    className={cn(
                      'align-top px-4 py-3 text-sm leading-6 text-muted-foreground',
                      column.className,
                    )}
                    key={column.key}
                  >
                    <div className="min-w-[10rem]">{renderDocsCell(row[column.key])}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="code-block whitespace-pre-wrap">
      <code>{code}</code>
    </pre>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  )
}

function renderDocsCell(value: React.ReactNode) {
  if (typeof value === 'string' && value.startsWith('`') && value.endsWith('`')) {
    return <InlineCode>{value.slice(1, -1)}</InlineCode>
  }

  return value
}

function DocsSectionBlock({
  children,
  description,
  id,
  title,
}: {
  children: React.ReactNode
  description: string
  id: string
  title: string
}) {
  return (
    <section className="scroll-mt-28 space-y-4" id={id}>
      <div className="space-y-2">
        <h3 className="font-display text-3xl tracking-[-0.04em] text-foreground">{title}</h3>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function DocsPageContent({ pageId }: { pageId: DocsPageId }) {
  if (pageId === 'overview') {
    return (
      <div className="space-y-10">
        <DocsSectionBlock
          description="`reveal-ui` is for choices that need more than a label before the user can decide. The summary stays visible, the detail opens inline, and the surrounding workflow does not disappear."
          id="docs-overview-problem-fit"
          title="Use it when the current workflow should stay in view"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-md bg-background/80 shadow-none">
              <CardContent className="space-y-3 p-5">
                <Badge variant="secondary">Good fit</Badge>
                <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                  <li>Inline editors that should not replace the summary they are editing.</li>
                  <li>Card stacks where only one item should open at a time.</li>
                  <li>Nested flows that need close propagation without building modal chains.</li>
                  <li>
                    Selection tasks where a label alone hides price, risk, timing, or caveats.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-md bg-background/80 shadow-none">
              <CardContent className="space-y-3 p-5">
                <Badge variant="outline">Skip it when</Badge>
                <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                  <li>A normal accordion already keeps enough context visible.</li>
                  <li>
                    The choice is actually a simple primitive value with no comparison burden.
                  </li>
                  <li>The UI needs a true modal because the surrounding app must become inert.</li>
                  <li>
                    The reveal content should unmount immediately with no phase-aware exit work.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </DocsSectionBlock>

        <DocsSectionBlock
          description="The component is deliberately shaped around three persistent regions instead of one summary block and one hidden panel."
          id="docs-overview-mental-model"
          title="The mental model is top, reveal, bottom"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                label: 'RevealPanel.Top',
                text: 'Summary, heading, and trigger live here. This region stays mounted before, during, and after the reveal.',
              },
              {
                label: 'content',
                text: 'The inserted detail layer. It can be static content or a render function that reads the live reveal phase.',
              },
              {
                label: 'RevealPanel.Bottom',
                text: 'Footer actions, metrics, or summary context that should remain visible below the inserted detail.',
              },
            ].map((item) => (
              <Card className="rounded-md bg-background/80 shadow-none" key={item.label}>
                <CardContent className="space-y-3 p-5">
                  <Badge variant="outline">{item.label}</Badge>
                  <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocsSectionBlock>

        <DocsSectionBlock
          description="This is the smallest useful integration surface for a production app. Start here, then add groups, scroll coordination, or more phase-aware motion as needed."
          id="docs-overview-quick-start"
          title="Start with one panel and one trigger"
        >
          <CodeSnippet code={quickStartSnippet} />
          <div className="rounded-md bg-secondary/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
            Use `keepMounted` when the revealed subtree itself needs to see `closed` and `closing`
            instead of unmounting between cycles.
          </div>
        </DocsSectionBlock>
      </div>
    )
  }

  if (pageId === 'installation') {
    return (
      <div className="space-y-10">
        <DocsSectionBlock
          description="Install the library plus its peers. The package intentionally keeps the dependency surface small."
          id="docs-installation-install-commands"
          title="Install commands"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {installCommands.map((item) => (
              <Card className="rounded-md bg-background/80 shadow-none" key={item.label}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.label}</Badge>
                    <span className="text-sm text-muted-foreground">{item.note}</span>
                  </div>
                  <div className="code-block">{item.command}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocsSectionBlock>

        <DocsSectionBlock
          description="The package is built for React 19 and uses `motion` only when motion-enhanced transitions are enabled."
          id="docs-installation-peer-dependencies"
          title="Peer dependencies"
        >
          <DocsTable
            columns={[
              { key: 'package', label: 'Package', className: 'w-[14rem]' },
              { key: 'version', label: 'Version', className: 'w-[10rem]' },
              { key: 'note', label: 'Why it is needed' },
            ]}
            rows={peerRows}
          />
        </DocsSectionBlock>

        <DocsSectionBlock
          description="Import only the pieces you need. The local Next example is useful when you want to study the pattern in a full page."
          id="docs-installation-imports"
          title="Imports and local preview"
        >
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <CodeSnippet code={importSnippet} />
            <div className="space-y-4">
              <Card className="rounded-md bg-background/80 shadow-none">
                <CardContent className="space-y-3 p-5">
                  <Badge variant="outline">Preview the example app</Badge>
                  <CodeSnippet code={previewSnippet} />
                </CardContent>
              </Card>
              <div className="rounded-md bg-secondary/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
                `RevealPanel` is the package primitive. If an older prerelease imported
                `RevealSplitter`, rename that import before upgrading.
              </div>
            </div>
          </div>
        </DocsSectionBlock>
      </div>
    )
  }

  if (pageId === 'composition') {
    return (
      <div className="space-y-10">
        <DocsSectionBlock
          description="Think of the component as a mounted sandwich: top and bottom stay put, the reveal inserts itself between them, and the layout remains local."
          id="docs-composition-anatomy"
          title="Three-part anatomy"
        >
          <div className="space-y-3 rounded-md bg-background/80 p-5">
            <div className="rounded-md bg-card px-4 py-4">
              <p className="font-semibold text-foreground">1. Top region</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Place the summary, headline, current state, and the control that opens the reveal.
              </p>
            </div>
            <div className="rounded-md bg-secondary/40 px-4 py-4">
              <p className="font-semibold text-foreground">2. Inserted reveal content</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This content expands inline. It can coordinate animation, prefetching, and nested
                close behavior through the panel lifecycle.
              </p>
            </div>
            <div className="rounded-md bg-card px-4 py-4">
              <p className="font-semibold text-foreground">3. Bottom region</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep summary metrics, footer actions, or status visible so the reveal does not feel
                detached from the task around it.
              </p>
            </div>
          </div>
        </DocsSectionBlock>

        <DocsSectionBlock
          description="Render-prop content is the main hook for phase-aware integration. It keeps the reveal API explicit and local."
          id="docs-composition-render-props"
          title="Render-prop contract"
        >
          <DocsTable
            columns={[
              { key: 'field', label: 'Field', className: 'w-[14rem]' },
              { key: 'value', label: 'Type', className: 'w-[12rem]' },
              { key: 'details', label: 'How to use it' },
            ]}
            rows={renderPropRows}
          />
        </DocsSectionBlock>

        <DocsSectionBlock
          description="Use the state hook when a nested child needs panel information but you do not want to thread render props through the tree."
          id="docs-composition-panel-state"
          title="Read panel state from anywhere below"
        >
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <CodeSnippet code={stateSnippet} />
            <div className="space-y-4">
              <div className="rounded-md bg-secondary/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
                `useRevealPanelState()` throws outside a `RevealPanel`, which keeps incorrect usage
                obvious during integration.
              </div>
              <div className="rounded-md bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
                Reach for the hook when a deeply nested motion block, data prefetcher, or inline
                status chip needs the real reveal phase and not a mirrored local state flag.
              </div>
            </div>
          </div>
        </DocsSectionBlock>
      </div>
    )
  }

  if (pageId === 'api') {
    return (
      <div className="space-y-10">
        <DocsSectionBlock
          description="The library keeps the public surface narrow. Most real-world integrations center on one `RevealPanel`, optional `RevealGroup`, and trigger helpers."
          id="docs-api-components"
          title="Component exports"
        >
          <DocsTable
            columns={[
              { key: 'component', label: 'Export', className: 'w-[14rem]' },
              { key: 'purpose', label: 'Purpose', className: 'w-[18rem]' },
              { key: 'notes', label: 'Notes' },
            ]}
            rows={componentRows}
          />
        </DocsSectionBlock>

        <DocsSectionBlock
          description="These props control the core panel contract: what reveals, how it is controlled, how sibling panels behave, and how delegated controls are identified."
          id="docs-api-panel-control"
          title="RevealPanel control and composition props"
        >
          <DocsTable
            columns={[
              { key: 'prop', label: 'Prop', className: 'w-[14rem]' },
              { key: 'type', label: 'Type', className: 'w-[15rem]' },
              { key: 'details', label: 'Details' },
            ]}
            rows={controlPropRows}
          />
        </DocsSectionBlock>

        <DocsSectionBlock
          description="These props matter when the reveal needs to align itself in the viewport or coordinate motion with the surrounding layout."
          id="docs-api-scroll-and-motion"
          title="Scroll and motion props"
        >
          <DocsTable
            columns={[
              { key: 'prop', label: 'Prop', className: 'w-[14rem]' },
              { key: 'type', label: 'Type', className: 'w-[17rem]' },
              { key: 'details', label: 'Details' },
            ]}
            rows={motionPropRows}
          />
        </DocsSectionBlock>
      </div>
    )
  }

  if (pageId === 'behavior') {
    return (
      <div className="space-y-10">
        <DocsSectionBlock
          description="The lifecycle is intentionally explicit so inner content can coordinate fetches, motion, and cleanup without inventing a second open-state model."
          id="docs-behavior-lifecycle"
          title="Lifecycle phases"
        >
          <DocsTable
            columns={[
              { key: 'phase', label: 'Phase', className: 'w-[12rem]' },
              { key: 'timing', label: 'When it happens', className: 'w-[20rem]' },
              { key: 'use', label: 'What it is good for' },
            ]}
            rows={phaseRows}
          />
        </DocsSectionBlock>

        <DocsSectionBlock
          description="Nested children can close their own panel, suppress focus restoration, or collapse outer panels in one call."
          id="docs-behavior-close-options"
          title="Close options"
        >
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <DocsTable
              columns={[
                { key: 'option', label: 'Option', className: 'w-[12rem]' },
                { key: 'type', label: 'Type', className: 'w-[10rem]' },
                { key: 'details', label: 'Details' },
              ]}
              rows={closeOptionRows}
            />
            <Card className="rounded-md bg-background/80 shadow-none">
              <CardContent className="space-y-3 p-5">
                <Badge variant="outline">Common pattern</Badge>
                <CodeSnippet code={`close({ propagate: true })`} />
                <p className="text-sm leading-6 text-muted-foreground">
                  Use propagation when a nested reveal completes the task and the outer reveal
                  should collapse with it.
                </p>
              </CardContent>
            </Card>
          </div>
        </DocsSectionBlock>

        <DocsSectionBlock
          description="For chooser-like stacks, `RevealGroup` removes the need to hand-coordinate sibling teardown. For controlled flows, the panel still behaves cleanly inside external state."
          id="docs-behavior-group-behavior"
          title="Groups, nesting, and controlled state"
        >
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div className="rounded-md bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
                `RevealGroup` defaults `closeSiblings` to `true`, so opening one panel in the group
                closes the rest unless you opt out.
              </div>
              <div className="rounded-md bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
                Nested panels keep their own lifecycle state while still allowing inner children to
                close outward with `propagate`.
              </div>
              <div className="rounded-md bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
                Controlled mode is useful when a parent workflow, router, or server action decides
                whether the reveal should stay open.
              </div>
            </div>
            <CodeSnippet code={controlledSnippet} />
          </div>
        </DocsSectionBlock>
      </div>
    )
  }

  if (pageId === 'accessibility') {
    return (
      <div className="space-y-10">
        <DocsSectionBlock
          description="The primitive keeps the main accessibility contract on the component itself so teams do not have to rebuild ARIA wiring for every reveal."
          id="docs-accessibility-semantics"
          title="Semantics and state signals"
        >
          <DocsTable
            columns={[
              { key: 'area', label: 'Area', className: 'w-[16rem]' },
              { key: 'details', label: 'Behavior' },
            ]}
            rows={accessibilityRows}
          />
        </DocsSectionBlock>

        <DocsSectionBlock
          description="You can attach trigger behavior to existing markup when a separate button would harm the layout, but the semantics still need to stay explicit."
          id="docs-accessibility-delegated-triggers"
          title="Delegated triggers and restore controls"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-md bg-background/80 shadow-none">
              <CardContent className="space-y-3 p-5">
                <Badge variant="secondary">triggerAttr</Badge>
                <p className="text-sm leading-6 text-muted-foreground">
                  Mark an existing element as the delegated opener. The panel applies button-like
                  semantics, keyboard support, and ARIA wiring when the node is not naturally
                  interactive.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-md bg-background/80 shadow-none">
              <CardContent className="space-y-3 p-5">
                <Badge variant="outline">restoreAttr</Badge>
                <p className="text-sm leading-6 text-muted-foreground">
                  Mark an element that should behave like a close control and participate in focus
                  restoration semantics without needing a separate `RevealClose` wrapper.
                </p>
              </CardContent>
            </Card>
          </div>
        </DocsSectionBlock>

        <DocsSectionBlock
          description="The component does not treat motion as decoration. Scroll and motion behavior degrade in reduced-motion environments so the interaction stays legible."
          id="docs-accessibility-focus-and-motion"
          title="Focus handling and reduced-motion behavior"
        >
          <div className="space-y-4">
            <div className="rounded-md bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
              By default, close actions restore focus to the last trigger. Disable that globally
              with <InlineCode>{'restoreFocusOnClose={false}'}</InlineCode> or per-close with{' '}
              <InlineCode>{'close({ restoreFocus: false })'}</InlineCode> when the next focus target
              should be determined elsewhere.
            </div>
            <div className="rounded-md bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
              If the user prefers reduced motion, reveal transitions and coordinated scroll timing
              simplify instead of trying to force the full animation path.
            </div>
          </div>
        </DocsSectionBlock>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <DocsSectionBlock
        description="Older prerelease builds exposed `RevealSplitter`. The package now exports only `RevealPanel`, so rename the import when upgrading."
        id="docs-migration-upgrade"
        title="Upgrade older imports"
      >
        <CodeSnippet code={upgradeSnippet} />
      </DocsSectionBlock>

      <DocsSectionBlock
        description="These are the full repository checks used before publishing or shipping package changes."
        id="docs-migration-validation"
        title="Validation commands"
      >
        <CodeSnippet code={validationSnippet} />
      </DocsSectionBlock>

      <DocsSectionBlock
        description="The Next example is useful when you want to inspect a realistic integration surface instead of only the package README."
        id="docs-migration-local-example"
        title="Run the local example"
      >
        <CodeSnippet code={previewSnippet} />
      </DocsSectionBlock>
    </div>
  )
}

function DocsSectionJump({ label, targetId }: { label: string; targetId: string }) {
  return (
    <button
      className="text-left text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => {
        const element = document.getElementById(targetId)
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
      type="button"
    >
      {label}
    </button>
  )
}

export function DocsExperience() {
  const [activePage, setActivePage] = React.useState<DocsPageId>('overview')
  const page = getDocsPage(activePage)

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <Badge className="section-kicker" variant="outline">
          Docs
        </Badge>
        <div className="space-y-3">
          <h2 className="font-display text-4xl tracking-[-0.04em] text-foreground md:text-5xl">
            Developer docs that read like a real reference surface
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            The docs are now organized for people first: fast scanning, precise API tables, direct
            installation guidance, and the lifecycle details you need when the reveal becomes part
            of real product flow.
          </p>
        </div>
      </div>

      <Card className="glass-card overflow-hidden rounded-md border border-border/35">
        <CardContent className="p-0">
          <div className="grid xl:grid-cols-[15rem_minmax(0,1fr)_14rem]">
            <aside className="border-b border-border/25 bg-secondary/30 p-4 xl:border-b-0 xl:border-r">
              <div className="space-y-3 xl:sticky xl:top-24">
                <p className="text-sm font-semibold text-foreground">Browse docs</p>
                <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0">
                  {docsPages.map((item) => {
                    const isActive = item.id === activePage

                    return (
                      <button
                        className={cn(
                          'min-w-[12rem] rounded-md px-4 py-3 text-left transition-colors xl:min-w-0',
                          isActive
                            ? 'bg-background text-foreground'
                            : 'bg-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground',
                        )}
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        type="button"
                      >
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-1 text-sm leading-6">{item.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            <article className="min-w-0 border-b border-border/25 p-5 md:p-7 xl:border-b-0">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">{page.label}</Badge>
                  <div className="flex flex-wrap gap-2">
                    {pageFacts[activePage].map((fact) => (
                      <Badge key={fact} variant="outline">
                        {fact}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  {page.description}
                </p>
              </div>

              <Separator className="my-6" />

              <DocsPageContent pageId={activePage} />
            </article>

            <aside className="hidden bg-background/60 p-5 xl:block">
              <div className="space-y-6 xl:sticky xl:top-24">
                <div className="space-y-3 rounded-md bg-background/85 p-4">
                  <p className="text-sm font-semibold text-foreground">On this page</p>
                  <div className="flex flex-col gap-2">
                    {page.sections.map((section) => (
                      <DocsSectionJump
                        key={section.id}
                        label={section.label}
                        targetId={`docs-${activePage}-${section.id}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-md bg-secondary/35 p-4">
                  <p className="text-sm font-semibold text-foreground">Quick facts</p>
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                    <li>Primary primitive: `RevealPanel`.</li>
                    <li>Lifecycle phases: `closed`, `opening`, `open`, `closing`.</li>
                    <li>Best fit: inline reveal editors, expanding cards, nested reveal flows.</li>
                    <li>Package CI covers lint, tests, pack, smoke, and coverage upload.</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
