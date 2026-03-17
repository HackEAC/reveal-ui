'use client'

import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Clock3,
  Focus,
  GitCompareArrows,
  Menu,
  Moon,
  SearchCode,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from 'lucide-react'
import * as React from 'react'
import {
  RevealClose,
  RevealGroup,
  RevealPanel,
  type RevealPanelProps,
  RevealTrigger,
} from 'reveal-ui'
import { RevealLogoMark } from '@/components/site/logo-mark'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { siteConfig } from '@/lib/site'
import { cn } from '@/lib/utils'

type Property = {
  id: string
  label: string
  location: string
  summary: string
  price: string
  yield: string
  occupancy: string
  risk: string
  setupTime: string
  note: string
  attributes: Array<{
    label: string
    value: string
  }>
}

const properties: Property[] = [
  {
    id: 'palm-residency',
    label: 'Palm Residency A12',
    location: 'Msasani Peninsula',
    summary: 'Stable occupancy, fast approvals, premium tenant profile.',
    price: '$1.92M',
    yield: '8.7%',
    occupancy: '94%',
    risk: 'Low',
    setupTime: '11 days',
    note: 'Strong choice when the user cares about predictable operating profile over raw headline yield.',
    attributes: [
      { label: 'Lease floor', value: '$14.8K / month' },
      { label: 'Permits', value: 'Ready to issue' },
      { label: 'Turnaround', value: '11-day onboarding' },
      { label: 'Utilities', value: 'Smart metering installed' },
    ],
  },
  {
    id: 'nyota-terrace',
    label: 'Nyota Terrace C4',
    location: 'City Centre',
    summary: 'Best fit for low-risk teams that want central access and fewer unknowns.',
    price: '$2.08M',
    yield: '7.9%',
    occupancy: '97%',
    risk: 'Low',
    setupTime: '9 days',
    note: 'Excellent retention and low operational drama, but it is not the cheapest option.',
    attributes: [
      { label: 'Lease floor', value: '$15.3K / month' },
      { label: 'Permits', value: 'All clear' },
      { label: 'Turnaround', value: '9-day onboarding' },
      { label: 'Foot traffic', value: 'Prime mixed-use corridor' },
    ],
  },
  {
    id: 'kivuli-courtyard',
    label: 'Kivuli Courtyard B7',
    location: 'Mikocheni',
    summary: 'Higher upside, more detail to inspect, and more reasons users hesitate.',
    price: '$1.64M',
    yield: '9.3%',
    occupancy: '88%',
    risk: 'Medium',
    setupTime: '18 days',
    note: 'This one looks attractive on yield alone, but the permit timing and upgrade path matter before selection.',
    attributes: [
      { label: 'Lease floor', value: '$13.2K / month' },
      { label: 'Permits', value: 'Pending signage approval' },
      { label: 'Turnaround', value: '18-day onboarding' },
      { label: 'Upgrade scope', value: 'Lobby refresh queued' },
    ],
  },
  {
    id: 'harbor-ridge',
    label: 'Harbor Ridge D2',
    location: 'Upanga',
    summary: 'Highest headline yield, but risk and fit are only obvious after inspection.',
    price: '$1.48M',
    yield: '10.1%',
    occupancy: '82%',
    risk: 'High',
    setupTime: '23 days',
    note: 'The kind of option that makes a single-line select label actively misleading.',
    attributes: [
      { label: 'Lease floor', value: '$12.9K / month' },
      { label: 'Permits', value: 'Operational, renovation pending' },
      { label: 'Turnaround', value: '23-day onboarding' },
      { label: 'Caveat', value: 'Two vacant anchor units' },
    ],
  },
]

const pressureCards = [
  {
    description:
      'Great when a choice is only a name. Weak when a user needs price, risk, occupancy, timing, and caveats before committing.',
    implementationWeirdness: 'Medium',
    intensity: 'High',
    issues: [
      'Users pick first, inspect later.',
      'Important attributes collapse into awkward labels or disappear entirely.',
      'Comparison becomes memory work instead of visible UI.',
    ],
    timeWaste: 'High',
    title: 'Classic select',
  },
  {
    description:
      'The details exist, but the user has to leave the current context to evaluate them in a second focus trap.',
    implementationWeirdness: 'High',
    intensity: 'High',
    issues: [
      'The active modal makes the underlying workflow inert.',
      'Escape, back, and focus-return logic become layered.',
      'Draft context disappears exactly when the user needs it.',
    ],
    timeWaste: 'Medium',
    title: 'Secondary picker modal',
  },
  {
    description:
      'The current summary stays visible while richer details open inline between persistent top and bottom regions.',
    implementationWeirdness: 'Low',
    intensity: 'Low',
    issues: [
      'Details stay next to the form that needs them.',
      'Sibling exclusivity and nested close propagation are built in.',
      'The user can compare without breaking focus or layout context.',
    ],
    timeWaste: 'Low',
    title: 'RevealPanel',
  },
]

const aiContext = [
  'Primary API: `RevealPanel` for persistent-summary disclosure in React.',
  'Related exports: `RevealGroup`, `RevealTrigger`, `RevealClose`, and the deprecated alias `RevealSplitter`.',
  'The `content` prop accepts either nodes or a render function with `open`, `close`, `isOpen`, and IDs.',
  'Best fit: inline reveal editors, expanding card disclosure, and nested reveal flows inside dialogs or cards.',
  'Key behaviors: grouped sibling exclusivity, nested close propagation, optional motion, and scroll coordination.',
]

const faqItems = [
  {
    answer:
      'No. Accordions usually toggle a header and panel. `RevealPanel` keeps persistent top and bottom regions mounted, then inserts richer content between them.',
    question: 'Is reveal-ui just another accordion?',
    value: 'item-1',
  },
  {
    answer:
      'Because the decision often is not just a value. If a user needs to compare occupancy, risk, timeline, notes, and fit, a select either hides that context or forces awkward option labels.',
    question: 'Why not stay with a select?',
    value: 'item-2',
  },
  {
    answer:
      'You can, but a modal dialog intentionally traps focus and makes the rest of the app inert. Opening another picker modal inside that flow adds state, escape semantics, and context switching on top of the actual task.',
    question: 'Why avoid a second modal chooser?',
    value: 'item-3',
  },
  {
    answer:
      'Yes. The site ships explicit metadata, structured data, sitemap, robots, and `llms.txt`. The docs also state the API in direct terms so agents can identify the primitive quickly.',
    question: 'Is the site optimized for AI-assisted development?',
    value: 'item-4',
  },
]

const installSnippet = `npm install reveal-ui motion react react-dom`

const exampleSnippet = `import {
  RevealClose,
  RevealGroup,
  RevealPanel,
  RevealTrigger,
} from 'reveal-ui'

<RevealPanel
  content={({ close }) => (
    <RevealGroup closeSiblings>
      <PropertyChoices
        onPick={(propertyId) => {
          setProperty(propertyId)
          close()
        }}
      />
    </RevealGroup>
  )}
>
  <RevealPanel.Top>
    <RevealTrigger>Compare properties inline</RevealTrigger>
  </RevealPanel.Top>
  <RevealPanel.Bottom>
    <FooterSummary />
  </RevealPanel.Bottom>
</RevealPanel>`

const navigationItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'why', label: 'Why' },
  { id: 'lab', label: 'Lab' },
  { id: 'ai-context', label: 'AI context' },
  { id: 'faq', label: 'FAQ' },
] as const

const stickyHeaderScrollOffset = 96
const chooserViewportScrollOffset = 12
const themeStorageKey = 'reveal-ui-docs-theme'

type ThemeMode = 'light' | 'dark'
type RevealScrollContainer = RevealPanelProps['scrollContainer']

function getProperty(propertyId: string) {
  return properties.find((property) => property.id === propertyId) ?? properties[0]
}

function toneClass(level: string) {
  if (level === 'Low') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (level === 'Medium') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-rose-50 text-rose-700'
}

function SectionHeading({
  description,
  id,
  kicker,
  title,
}: {
  description: string
  id?: string
  kicker: string
  title: string
}) {
  return (
    <div className="max-w-3xl space-y-4" id={id}>
      <Badge className="section-kicker" variant="outline">
        {kicker}
      </Badge>
      <div className="space-y-3">
        <h2 className="font-display text-4xl tracking-[-0.04em] text-foreground md:text-5xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>
    </div>
  )
}

function PressureCard({
  description,
  implementationWeirdness,
  intensity,
  issues,
  timeWaste,
  title,
}: (typeof pressureCards)[number]) {
  return (
    <Card className="glass-card h-full rounded-md">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn('px-3 py-1 text-[0.7rem]', toneClass(intensity))}>
            user intensity {intensity}
          </Badge>
          <Badge className={cn('px-3 py-1 text-[0.7rem]', toneClass(timeWaste))}>
            time waste {timeWaste}
          </Badge>
          <Badge className={cn('px-3 py-1 text-[0.7rem]', toneClass(implementationWeirdness))}>
            UI weirdness {implementationWeirdness}
          </Badge>
        </div>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.map((issue) => (
          <div
            className="rounded-md bg-background px-4 py-3 text-sm leading-6 text-foreground/85"
            key={issue}
          >
            {issue}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function HeroPreview() {
  const featured = getProperty('palm-residency')

  return (
    <RevealPanel
      className="rounded-md bg-card shadow-soft"
      content={() => (
        <div className="bg-card px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {featured.attributes.map((attribute) => (
              <div className="rounded-md bg-accent px-4 py-3" key={attribute.label}>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {attribute.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{attribute.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      defaultOpen
      magicMotion
      regionLabel="Hero reveal preview"
    >
      <RevealPanel.Top>
        <div className="rounded-t-md bg-card px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="secondary">Persistent top region</Badge>
              <div>
                <p className="text-sm font-semibold text-foreground">{featured.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{featured.summary}</p>
              </div>
            </div>
            <RevealTrigger asChild>
              <Button size="sm" variant="secondary">
                Reveal details
              </Button>
            </RevealTrigger>
          </div>
        </div>
      </RevealPanel.Top>

      <RevealPanel.Bottom>
        <div className="rounded-b-md bg-secondary px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="outline">Persistent bottom region</Badge>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Yield {featured.yield}</Badge>
              <Badge variant="outline">Occupancy {featured.occupancy}</Badge>
              <Badge variant="outline">Risk {featured.risk}</Badge>
            </div>
          </div>
        </div>
      </RevealPanel.Bottom>
    </RevealPanel>
  )
}

function SelectTrapDemo() {
  const [comparisonPasses, setComparisonPasses] = React.useState(1)
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(properties[0].id)
  const selectedProperty = getProperty(selectedPropertyId)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="glass-card overflow-hidden rounded-md">
        <CardHeader>
          <Badge variant="outline">Problem 1</Badge>
          <CardTitle>The select only shows the label, not the decision</CardTitle>
          <CardDescription>
            The user can only see the property name inside the chooser. The meaningful context
            arrives after selection, which means every comparison is a guess first and a review
            second.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property-select">Property</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedPropertyId(value)
                  setComparisonPasses((current) => current + 1)
                }}
                value={selectedPropertyId}
              >
                <SelectTrigger id="property-select">
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Only the label fits comfortably</SelectLabel>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <div className="px-3 py-2 text-xs leading-5 text-muted-foreground">
                    Price, risk, permits, timeline, and notes are invisible until after the pick.
                  </div>
                </SelectContent>
              </Select>
            </div>

            <Card className="rounded-md bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{selectedProperty.label}</CardTitle>
                <CardDescription>
                  The detail card lives outside the chooser, so comparison is serial instead of
                  visible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Price', selectedProperty.price],
                    ['Yield', selectedProperty.yield],
                    ['Occupancy', selectedProperty.occupancy],
                    ['Risk', selectedProperty.risk],
                  ].map(([label, value]) => (
                    <div className="rounded-md bg-muted px-4 py-3" key={label}>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{selectedProperty.note}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-md bg-background shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Friction created by the control</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Comparison passes', String(comparisonPasses)],
                  ['Visible attributes before select', '1'],
                  ['Hidden attributes before select', '5+'],
                ].map(([label, value]) => (
                  <div className="rounded-md bg-card px-4 py-4" key={label}>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-2 font-display text-3xl tracking-[-0.04em] text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-md bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">The awkward fallback developers try</CardTitle>
                <CardDescription>
                  Squeezing multiple fields into the option text makes the list noisy without
                  solving real comparison.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted px-4 py-4 font-mono text-xs leading-6 text-foreground/80">
                  {`${selectedProperty.label} | ${selectedProperty.price} | ${selectedProperty.yield} | ${selectedProperty.occupancy} | ${selectedProperty.risk}`}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card rounded-md">
        <CardHeader>
          <Badge variant="outline">Why it feels slow</Badge>
          <CardTitle>The user has to remember more than the UI shows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            'The option list exposes a name but not the reasons behind the choice.',
            'Switching between candidates repeats the same open, select, inspect loop.',
            'The surrounding draft or current screen gives no inline comparison surface.',
          ].map((item) => (
            <div
              className="rounded-md bg-card px-4 py-3 text-sm leading-6 text-muted-foreground"
              key={item}
            >
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ModalDetourDemo() {
  const [memoDialogOpen, setMemoDialogOpen] = React.useState(false)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [draftTitle, setDraftTitle] = React.useState('New portfolio allocation memo')
  const [draftNote, setDraftNote] = React.useState(
    'Need a property with clean permits and predictable occupancy before finance review.',
  )
  const [selectedPropertyId, setSelectedPropertyId] = React.useState('nyota-terrace')
  const selectedProperty = getProperty(selectedPropertyId)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="glass-card rounded-md">
        <CardHeader>
          <Badge variant="outline">Problem 2</Badge>
          <CardTitle>The secondary modal solves detail by stealing context</CardTitle>
          <CardDescription>
            A second picker modal keeps the rich list somewhere else. That preserves the details,
            but it pauses the actual workflow while the user deals with another focus trap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog onOpenChange={setMemoDialogOpen} open={memoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                Open valuation memo modal
                <ArrowRight className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(96vw,900px)]">
              <DialogHeader>
                <DialogTitle>Prepare valuation memo</DialogTitle>
                <DialogDescription>
                  This dialog is the real task. Now imagine leaving it to evaluate a property in a
                  second modal.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memo-title">Memo title</Label>
                    <Input
                      id="memo-title"
                      onChange={(event) => setDraftTitle(event.target.value)}
                      value={draftTitle}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memo-notes">Why this property matters</Label>
                    <Textarea
                      id="memo-notes"
                      onChange={(event) => setDraftNote(event.target.value)}
                      rows={5}
                      value={draftNote}
                    />
                  </div>
                </div>

                <Card className="rounded-md bg-secondary shadow-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Current selection</CardTitle>
                    <CardDescription>
                      The property summary is useful, but it is not where the comparison happens.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md bg-card px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{selectedProperty.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedProperty.location}
                          </p>
                        </div>
                        <Badge variant="outline">Risk {selectedProperty.risk}</Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">Yield {selectedProperty.yield}</Badge>
                        <Badge variant="secondary">Occupancy {selectedProperty.occupancy}</Badge>
                        <Badge variant="secondary">Setup {selectedProperty.setupTime}</Badge>
                      </div>
                    </div>

                    <Dialog onOpenChange={setPickerOpen} open={pickerOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Open property picker modal</Button>
                      </DialogTrigger>
                      <DialogContent className="w-[min(96vw,760px)]">
                        <DialogHeader>
                          <DialogTitle>Select a property</DialogTitle>
                          <DialogDescription>
                            Rich detail now lives in a second modal layer instead of next to the
                            draft that needs it.
                          </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="h-[360px] rounded-md bg-background">
                          <div className="space-y-3 p-4">
                            {properties.map((property) => (
                              <Card className="rounded-md bg-card shadow-none" key={property.id}>
                                <CardHeader className="pb-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <CardTitle className="text-xl">{property.label}</CardTitle>
                                      <CardDescription>{property.summary}</CardDescription>
                                    </div>
                                    <Badge variant="outline">Risk {property.risk}</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                      ['Price', property.price],
                                      ['Yield', property.yield],
                                      ['Occupancy', property.occupancy],
                                      ['Setup', property.setupTime],
                                    ].map(([label, value]) => (
                                      <div className="rounded-md bg-muted px-4 py-3" key={label}>
                                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                          {label}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-foreground">
                                          {value}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  <Button
                                    onClick={() => {
                                      setSelectedPropertyId(property.id)
                                      setPickerOpen(false)
                                    }}
                                  >
                                    Use this property
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>

                        <DialogFooter>
                          <Button onClick={() => setPickerOpen(false)} variant="ghost">
                            Back to memo
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="glass-card rounded-md">
        <CardHeader>
          <Badge variant="outline">What the second modal adds</Badge>
          <CardTitle>The detour is now part of the product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              body:
                memoDialogOpen && pickerOpen
                  ? 'The property picker has focus. The memo underneath is still there conceptually, but it is no longer the active context.'
                  : 'Open the memo, then open the picker. You will feel the context switch immediately.',
              label: 'Focus stack',
            },
            {
              body: 'The active modal dialog owns keyboard focus while the underlying layer becomes inert, so state and focus-return logic have to coordinate across layers.',
              label: 'Accessibility burden',
            },
            {
              body: 'The engineering work is no longer only about choosing a property. It now includes cross-modal escape handling, pending state, and draft synchronization.',
              label: 'Implementation drag',
            },
          ].map((item) => (
            <div className="rounded-md bg-card px-4 py-4" key={item.label}>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function PropertyRevealCard({
  onSelect,
  property,
  selectedPropertyId,
  scrollContainer,
}: {
  onSelect: (propertyId: string) => void
  property: Property
  selectedPropertyId: string
  scrollContainer: RevealScrollContainer
}) {
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) return

    const panel = panelRef.current
    const container = typeof scrollContainer === 'function' ? scrollContainer() : scrollContainer
    if (!panel || !container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const panelTop =
      container.scrollTop +
      (panel.getBoundingClientRect().top - container.getBoundingClientRect().top)
    const targetTop = Math.max(0, panelTop - chooserViewportScrollOffset)

    container.scrollTo({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      top: targetTop,
    })
  }, [isOpen, scrollContainer])

  return (
    <RevealPanel
      className="overflow-hidden rounded-md bg-card shadow-none"
      content={({ close }) => (
        <div className="bg-card px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {property.attributes.map((attribute) => (
              <div className="rounded-md bg-muted px-4 py-3" key={attribute.label}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {attribute.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{attribute.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">{property.note}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                onSelect(property.id)
                close({ propagate: true })
              }}
            >
              Select {property.label}
            </Button>
            <RevealClose asChild>
              <Button variant="ghost">Keep comparing</Button>
            </RevealClose>
          </div>
        </div>
      )}
      magicMotion
      onOpenChange={setIsOpen}
      ref={panelRef}
      scrollContainer={scrollContainer}
      scrollOffset={chooserViewportScrollOffset}
      scrollOnOpen
    >
      <RevealPanel.Top>
        <div className="bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{property.label}</p>
                <Badge variant={selectedPropertyId === property.id ? 'secondary' : 'outline'}>
                  {selectedPropertyId === property.id ? 'Selected' : 'Comparable'}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{property.summary}</p>
            </div>
            <RevealTrigger asChild>
              <Button size="sm" variant="secondary">
                Inspect inline
              </Button>
            </RevealTrigger>
          </div>
        </div>
      </RevealPanel.Top>

      <RevealPanel.Bottom>
        <div className="bg-secondary px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Yield {property.yield}</Badge>
            <Badge variant="outline">Occupancy {property.occupancy}</Badge>
            <Badge variant="outline">Risk {property.risk}</Badge>
            <Badge variant="outline">Setup {property.setupTime}</Badge>
          </div>
        </div>
      </RevealPanel.Bottom>
    </RevealPanel>
  )
}

function RevealSolutionDemo() {
  const [selectedPropertyId, setSelectedPropertyId] = React.useState('palm-residency')
  const selectedProperty = getProperty(selectedPropertyId)
  const chooserViewportRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <RevealPanel
        className="glass-card overflow-hidden rounded-md"
        content={() => (
          <div className="bg-card px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="outline">RevealGroup inside the chooser</Badge>
                <p className="text-sm leading-6 text-muted-foreground">
                  Open one card at a time, inspect the attributes, and select inline. No second
                  modal required.
                </p>
              </div>
              <RevealClose asChild>
                <Button variant="ghost">Collapse chooser</Button>
              </RevealClose>
            </div>

            <ScrollArea
              className="mt-5 h-[26rem] rounded-md bg-background"
              viewportRef={chooserViewportRef}
            >
              <RevealGroup closeSiblings>
                <div className="space-y-3 p-4">
                  {properties.map((property) => (
                    <PropertyRevealCard
                      key={property.id}
                      onSelect={setSelectedPropertyId}
                      property={property}
                      selectedPropertyId={selectedPropertyId}
                      scrollContainer={() => chooserViewportRef.current}
                    />
                  ))}
                </div>
              </RevealGroup>
            </ScrollArea>
          </div>
        )}
        magicMotion
        regionLabel="Inline property chooser"
        scrollOffset={stickyHeaderScrollOffset}
        scrollOnOpen
      >
        <RevealPanel.Top>
          <div className="bg-card px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge variant="secondary">Solution</Badge>
                <div>
                  <h3 className="font-display text-3xl tracking-[-0.04em] text-foreground">
                    The comparison happens inside the current workflow
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    `RevealPanel` keeps the current summary visible, then inserts the chooser inline
                    between persistent top and bottom regions. The user never loses the form they
                    were actually working in.
                  </p>
                </div>
              </div>
              <RevealTrigger asChild>
                <Button size="lg">
                  Browse properties inline
                  <ArrowRight className="size-4" />
                </Button>
              </RevealTrigger>
            </div>
          </div>
        </RevealPanel.Top>

        <RevealPanel.Bottom>
          <div className="bg-secondary px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedProperty.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {selectedProperty.location} · {selectedProperty.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Price {selectedProperty.price}</Badge>
                <Badge variant="outline">Yield {selectedProperty.yield}</Badge>
                <Badge variant="outline">Risk {selectedProperty.risk}</Badge>
              </div>
            </div>
          </div>
        </RevealPanel.Bottom>
      </RevealPanel>

      <Card className="glass-card rounded-md">
        <CardHeader>
          <Badge variant="outline">Why it works</Badge>
          <CardTitle>The UI stays honest about the choice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            'The parent summary remains mounted while richer detail opens exactly where the user needs it.',
            'Nested reveal cards can close themselves and propagate upward when the selection is final.',
            'The UI still feels local to the surrounding form, card, or dialog instead of becoming a detached mini-app.',
          ].map((item) => (
            <div
              className="rounded-md bg-card px-4 py-4 text-sm leading-6 text-muted-foreground"
              key={item}
            >
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function ShowcasePage() {
  const [activeSection, setActiveSection] =
    React.useState<(typeof navigationItems)[number]['id']>('overview')
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<ThemeMode>('light')
  const currentYear = new Date().getFullYear()

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey)
    const prefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedTheme =
      storedTheme === 'dark' || storedTheme === 'light'
        ? storedTheme
        : prefersDark
          ? 'dark'
          : 'light'

    setTheme(resolvedTheme)
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(themeStorageKey, theme)
  }, [mounted, theme])

  React.useEffect(() => {
    const sectionElements = navigationItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement)

    if (sectionElements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              right.intersectionRatio - left.intersectionRatio ||
              left.boundingClientRect.top - right.boundingClientRect.top,
          )

        const nextSection = visibleEntries[0]?.target.id

        if (nextSection) {
          setActiveSection(nextSection as (typeof navigationItems)[number]['id'])
        }
      },
      {
        rootMargin: '-24% 0px -52% 0px',
        threshold: [0.2, 0.45, 0.7],
      },
    )

    for (const sectionElement of sectionElements) {
      observer.observe(sectionElement)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative pb-16" id="top">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/92 shadow-soft backdrop-blur">
        <div className="container flex min-h-16 items-center justify-between gap-4 px-6 py-3 md:px-8">
          <a className="flex items-center gap-3" href="#overview">
            <RevealLogoMark className="size-10 shrink-0 shadow-soft" />
            <p className="font-display text-xl tracking-[-0.03em] text-foreground">reveal-ui</p>
          </a>

          <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex">
            {navigationItems.map((item) => (
              <a
                className={cn(
                  'rounded-sm px-3 py-2 transition-colors',
                  activeSection === item.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
                href={`#${item.id}`}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  aria-label="Open mobile menu"
                  className="lg:hidden"
                  size="icon"
                  variant="outline"
                >
                  <Menu className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[min(92vw,24rem)] p-6 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Menu</DialogTitle>
                  <DialogDescription>
                    Jump between sections and open the repository from mobile.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-2 flex flex-col gap-2">
                  {navigationItems.map((item) => (
                    <DialogClose asChild key={item.id}>
                      <a
                        className={cn(
                          'rounded-sm px-3 py-3 text-sm font-semibold transition-colors',
                          activeSection === item.id
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                        href={`#${item.id}`}
                      >
                        {item.label}
                      </a>
                    </DialogClose>
                  ))}
                </div>

                <DialogFooter className="mt-2">
                  <DialogClose asChild>
                    <Button asChild variant="outline">
                      <a href="#lab">See the demos</a>
                    </Button>
                  </DialogClose>
                  <Button asChild>
                    <a href={siteConfig.repoUrl} rel="noreferrer" target="_blank">
                      GitHub
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button asChild className="hidden sm:inline-flex" size="sm" variant="outline">
              <a href="#lab">See the demos</a>
            </Button>
            <Button asChild className="hidden sm:inline-flex" size="sm">
              <a href={siteConfig.repoUrl} rel="noreferrer" target="_blank">
                GitHub
              </a>
            </Button>
            <Button
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() =>
                setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
              }
              size="icon"
              variant="outline"
            >
              {mounted && theme === 'dark' ? (
                <SunMedium className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="section-shell pt-14 md:pt-20" id="overview">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="space-y-5">
                  <h1 className="max-w-4xl font-display text-5xl tracking-[-0.06em] text-foreground text-balance md:text-7xl">
                    Show the choice,
                    <span className="text-primary"> not just the option label.</span>
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                    `reveal-ui` is a React library for persistent-summary disclosure. It is built
                    for the moments where a select is too cramped and a second modal is too
                    disruptive, especially when a user needs multiple attributes before choosing a
                    property, record, plan, or configuration.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="#lab">
                    Run the interactive lab
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#ai-context">Read the quick API context</a>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Focus,
                    label: 'Focus preserved',
                    text: 'The parent summary and footer stay mounted while detail opens inline.',
                  },
                  {
                    icon: GitCompareArrows,
                    label: 'Rich comparison',
                    text: 'Users compare attributes before they commit, not after.',
                  },
                  {
                    icon: Sparkles,
                    label: 'Nested by design',
                    text: 'Group exclusivity, nested close propagation, motion, and scroll are already handled.',
                  },
                ].map((item) => (
                  <Card className="glass-card rounded-md" key={item.label}>
                    <CardContent className="space-y-3 p-5">
                      <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <item.icon className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="glass-card rounded-md">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline">Install</Badge>
                    <div className="code-block">{installSnippet}</div>
                  </div>
                  <div className="max-w-sm text-sm leading-6 text-muted-foreground">
                    Primary API:{' '}
                    <span className="font-semibold text-foreground">`RevealPanel`</span>. Legacy
                    migration alias:{' '}
                    <span className="font-semibold text-foreground">`RevealSplitter`</span>.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <HeroPreview />
              <Card className="glass-card rounded-md">
                <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
                  {[
                    { label: 'Context visible', value: 'yes' as const },
                    { label: 'Multi-attribute review', value: 'Inline' },
                    { label: 'Extra modal required', value: 'no' as const },
                  ].map((item) => (
                    <div className="rounded-md bg-background px-4 py-4" key={item.label}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 font-display text-3xl tracking-[-0.04em] text-foreground">
                        {item.value === 'yes' ? (
                          <>
                            <span aria-hidden="true">✅</span>
                            <span className="sr-only">Yes</span>
                          </>
                        ) : item.value === 'no' ? (
                          <>
                            <span aria-hidden="true">❌</span>
                            <span className="sr-only">No</span>
                          </>
                        ) : (
                          item.value
                        )}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="section-shell" id="why">
          <SectionHeading
            description="When teams force a multi-attribute decision into the wrong control, the user pays with context loss and the developer pays with workaround UI."
            kicker="Where the friction comes from"
            title="Three patterns, three very different costs"
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {pressureCards.map((card) => (
              <PressureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section className="section-shell" id="lab">
          <SectionHeading
            description="The same property-chooser problem played three ways: the cramped select, the separate picker modal, and the inline reveal workflow."
            kicker="Interactive lab"
            title="Feel the tradeoffs instead of reading about them"
          />

          <div className="mt-10">
            <Tabs className="space-y-2" defaultValue="reveal">
              <TabsList>
                <TabsTrigger value="select">Select trap</TabsTrigger>
                <TabsTrigger value="modal">Nested modal detour</TabsTrigger>
                <TabsTrigger value="reveal">Reveal solution</TabsTrigger>
              </TabsList>
              <TabsContent value="select">
                <SelectTrapDemo />
              </TabsContent>
              <TabsContent value="modal">
                <ModalDetourDemo />
              </TabsContent>
              <TabsContent value="reveal">
                <RevealSolutionDemo />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="section-shell" id="ai-context">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-8">
              <SectionHeading
                description="The site is intentionally explicit so both humans and coding agents can identify the problem space and the public API quickly."
                kicker="AI + SEO context"
                title="Machine-readable where it helps, direct language where it matters"
              />

              <Card className="glass-card rounded-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Quick context for an AI agent</CardTitle>
                      <CardDescription>
                        This is the shortest truthful summary of what the package is and how to use
                        it.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiContext.map((item) => (
                    <div
                      className="rounded-md bg-card px-4 py-3 text-sm leading-6 text-foreground/85"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card rounded-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <SearchCode className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Drop-in starting point</CardTitle>
                      <CardDescription>
                        Enough code for a developer or agent to start integrating the pattern.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="code-block whitespace-pre-wrap">{exampleSnippet}</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">structured data</Badge>
                    <Badge variant="outline">sitemap</Badge>
                    <Badge variant="outline">robots</Badge>
                    <Badge variant="outline">manifest</Badge>
                    <Badge variant="outline">llms.txt</Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    These signals improve discoverability and machine readability. `llms.txt` is an
                    interoperability hint, not a guaranteed ranking factor.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <BrainCircuit className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Research notes behind the framing</CardTitle>
                      <CardDescription>
                        The page copy reflects platform guidance on select controls, modal dialogs,
                        and search discoverability.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select',
                      label: 'MDN on customizable select controls and browser limitations',
                    },
                    {
                      href: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
                      label: 'WAI-ARIA Authoring Practices for modal dialogs',
                    },
                    {
                      href: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
                      label: 'Google Search SEO starter guide',
                    },
                    {
                      href: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
                      label: 'Google guidance on structured data',
                    },
                  ].map((item) => (
                    <a
                      className="block rounded-md bg-card px-4 py-4 text-sm font-semibold leading-6 text-foreground transition-colors hover:bg-accent"
                      href={item.href}
                      key={item.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {item.label}
                    </a>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="section-shell" id="faq">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <Badge className="section-kicker" variant="outline">
                FAQ
              </Badge>
              <h2 className="font-display text-4xl tracking-[-0.04em] text-foreground md:text-5xl">
                Short answers for the questions teams ask first
              </h2>
              <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                The component is unusual on purpose. The questions below cover what it is, what it
                replaces, and when it earns its place.
              </p>
            </div>

            <Accordion className="space-y-4" collapsible type="single">
              {faqItems.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="section-shell pt-8">
        <Card className="glass-card rounded-md">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <RevealLogoMark className="size-10 shrink-0 shadow-soft" />
                  <p className="font-display text-3xl tracking-[-0.04em] text-foreground">
                    reveal-ui
                  </p>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Persistent-summary disclosure for inline reveal editors, expanding card
                  disclosure, and nested reveal flows in React.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="#lab">Replay the demos</a>
                </Button>
                <Button asChild>
                  <a href={siteConfig.repoUrl} rel="noreferrer" target="_blank">
                    View repository
                  </a>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Clock3,
                  label: 'Built for time-sensitive choice',
                  text: 'Use it when a user needs rich information before choosing, not after.',
                },
                {
                  icon: ShieldCheck,
                  label: 'Accessibility-aware by default',
                  text: 'Trigger semantics, focus restoration, and reduced motion behavior are already part of the primitive.',
                },
                {
                  icon: Focus,
                  label: 'Keep the current workflow visible',
                  text: 'The point is not more animation. The point is less context loss.',
                },
              ].map((item) => (
                <div className="rounded-md bg-card p-5" key={item.label}>
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Made with ❤️ by{' '}
              <a
                className="font-semibold text-foreground transition-colors hover:text-primary"
                href="https://github.com/HackEAC"
                rel="noreferrer"
                target="_blank"
              >
                HackEAC
              </a>{' '}
              Team {currentYear}
            </p>
          </CardContent>
        </Card>
      </footer>
    </div>
  )
}
