'use client'

import confetti from 'canvas-confetti'
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Clipboard,
  Clock3,
  ExternalLink,
  Focus,
  GitCompareArrows,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import * as React from 'react'
import {
  RevealClose,
  RevealGroup,
  RevealPanel,
  type RevealPanelProps,
  type RevealPhase,
  RevealTrigger,
  useRevealPanelState,
} from 'reveal-ui'
import { DocsExperience } from '@/components/site/docs-experience'
import { RevealLogoMark } from '@/components/site/logo-mark'
import { ScrollOnRevealAnchor } from '@/components/site/scroll-on-reveal-anchor'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const heroSignals = [
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
] as const

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
] as const

const researchLinks = [
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
] as const

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
      'Yes. The site ships explicit metadata, structured data, sitemap, robots, and `llms.txt`, so assistants can discover the package without needing a separate AI-only docs block.',
    question: 'Is the site optimized for AI-assisted development?',
    value: 'item-4',
  },
] as const

const installCommands = [
  {
    command: 'pnpm add reveal-ui motion react react-dom',
    description: 'Fast add for monorepos and workspaces.',
    manager: 'pnpm',
  },
  {
    command: 'npm install reveal-ui motion react react-dom',
    description: 'The default install for npm-based projects.',
    manager: 'npm',
  },
  {
    command: 'yarn add reveal-ui motion react react-dom',
    description: 'Use this when your project already runs on Yarn.',
    manager: 'yarn',
  },
  {
    command: 'bun add reveal-ui motion react react-dom',
    description: 'Lean install path for Bun-first apps.',
    manager: 'bun',
  },
] as const

const navigationItems = [
  { id: 'docs', label: 'Docs' },
  { id: 'faq', label: 'FAQ' },
] as const

const stickyHeaderScrollOffset = 96
const chooserViewportScrollOffset = 12
const themeStorageKey = 'reveal-ui-docs-theme'

type ThemeMode = 'light' | 'dark'
type LabTab = 'select' | 'modal' | 'reveal'
type MotionDepth = 'outer' | 'inner' | 'micro'
type RevealScrollContainer = RevealPanelProps['scrollContainer']

function getProperty(propertyId: string) {
  return properties.find((property) => property.id === propertyId) ?? properties[0]
}

function toneClass(level: string) {
  if (level === 'Low') {
    return 'bg-secondary text-secondary-foreground'
  }

  if (level === 'Medium') {
    return 'bg-accent text-accent-foreground'
  }

  return 'bg-primary/12 text-primary'
}

const phaseToneClass: Record<RevealPhase, string> = {
  closed: 'bg-secondary text-secondary-foreground',
  closing: 'bg-accent text-accent-foreground',
  open: 'bg-primary text-primary-foreground',
  opening: 'bg-primary/12 text-primary',
}

const revealEase = [0.22, 1, 0.36, 1] as const
const reducedEase = [0.25, 0.1, 0.25, 1] as const

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mediaQuery.matches)

    update()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update)
      return () => mediaQuery.removeEventListener('change', update)
    }

    mediaQuery.addListener(update)
    return () => mediaQuery.removeListener(update)
  }, [])

  return prefersReducedMotion
}

function getStageVariants(depth: MotionDepth, prefersReducedMotion: boolean): Variants {
  const settings =
    depth === 'outer'
      ? { blur: 16, closingScale: 0.985, hiddenY: 24, openY: 0 }
      : depth === 'inner'
        ? { blur: 12, closingScale: 0.99, hiddenY: 18, openY: 0 }
        : { blur: 8, closingScale: 0.995, hiddenY: 12, openY: 0 }

  const blur = prefersReducedMotion ? 0 : settings.blur
  const sharedTransition = prefersReducedMotion
    ? { duration: 0.18, ease: reducedEase }
    : { duration: 0.42, ease: revealEase }

  return {
    closed: {
      filter: `blur(${blur}px)`,
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.985,
      transition: sharedTransition,
      y: prefersReducedMotion ? 0 : settings.hiddenY,
    },
    closing: {
      filter: `blur(${Math.max(blur - 2, 0)}px)`,
      opacity: prefersReducedMotion ? 0 : 0.34,
      scale: prefersReducedMotion ? 1 : settings.closingScale,
      transition: sharedTransition,
      y: prefersReducedMotion ? 0 : -8,
    },
    open: {
      filter: 'blur(0px)',
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0.16 }
        : {
            delayChildren: 0.02,
            duration: 0.28,
            staggerChildren: 0.04,
            when: 'beforeChildren',
          },
      y: settings.openY,
    },
    opening: {
      filter: 'blur(0px)',
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0.2 }
        : {
            delayChildren: 0.08,
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.07,
            when: 'beforeChildren',
          },
      y: settings.openY,
    },
  }
}

function getItemVariants(prefersReducedMotion: boolean): Variants {
  return {
    closed: {
      filter: prefersReducedMotion ? 'blur(0px)' : 'blur(6px)',
      opacity: 0,
      transition: { duration: prefersReducedMotion ? 0.14 : 0.2 },
      y: prefersReducedMotion ? 0 : 10,
    },
    closing: {
      filter: prefersReducedMotion ? 'blur(0px)' : 'blur(4px)',
      opacity: prefersReducedMotion ? 0 : 0.22,
      transition: { duration: prefersReducedMotion ? 0.14 : 0.18 },
      y: prefersReducedMotion ? 0 : -6,
    },
    open: {
      filter: 'blur(0px)',
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0.14 : 0.26 },
      y: 0,
    },
    opening: {
      filter: 'blur(0px)',
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0.16 : 0.32, ease: [0.22, 1, 0.36, 1] },
      y: 0,
    },
  }
}

function RevealPhaseBadge({
  className,
  label,
  phase,
}: {
  className?: string
  label: string
  phase: RevealPhase
}) {
  return (
    <Badge className={cn('px-3 py-1.5', phaseToneClass[phase], className)}>
      {label} {phase}
    </Badge>
  )
}

function PanelPhaseBadge({ className, label }: { className?: string; label: string }) {
  const { phase } = useRevealPanelState()
  return <RevealPhaseBadge className={className} label={label} phase={phase} />
}

function PhaseStrip({
  compact = false,
  label = 'Lifecycle',
}: {
  compact?: boolean
  label?: string
}) {
  const { phase } = useRevealPanelState()
  const steps: RevealPhase[] = ['opening', 'open', 'closing', 'closed']

  return (
    <div
      className={cn(
        'rounded-md border border-border/60 bg-background/70',
        compact ? 'px-3 py-2' : 'px-4 py-3',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        {steps.map((step) => (
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-sm font-medium transition-colors',
              step === phase
                ? 'border-primary/20 bg-primary text-primary-foreground'
                : 'border-border/60 bg-card text-muted-foreground',
            )}
            key={step}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}

function MotionStage({
  children,
  className,
  depth,
  phase,
}: {
  children: React.ReactNode
  className?: string
  depth: MotionDepth
  phase: RevealPhase
}) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <motion.div
      animate={phase}
      aria-hidden={phase === 'closed'}
      className={cn(className, phase === 'closed' && 'pointer-events-none')}
      initial={false}
      variants={getStageVariants(depth, prefersReducedMotion)}
    >
      {children}
    </motion.div>
  )
}

function MotionItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <motion.div className={className} variants={getItemVariants(prefersReducedMotion)}>
      {children}
    </motion.div>
  )
}

function SectionHeading({
  description,
  kicker,
  title,
}: {
  description: string
  kicker: string
  title: string
}) {
  return (
    <div className="max-w-3xl space-y-4">
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

function HeroSignalCard({
  icon: Icon,
  label,
  text,
}: {
  icon: (typeof heroSignals)[number]['icon']
  label: string
  text: string
}) {
  return (
    <Card className="glass-card rounded-md border border-border/60">
      <CardContent className="space-y-3 p-5">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PressureMiniCard({
  description,
  implementationWeirdness,
  intensity,
  timeWaste,
  title,
}: (typeof pressureCards)[number]) {
  return (
    <Card className="h-full rounded-md bg-background/70 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn('px-3 py-1.5', toneClass(intensity))}>{intensity} intensity</Badge>
          <Badge className={cn('px-3 py-1.5', toneClass(timeWaste))}>{timeWaste} waste</Badge>
          <Badge className={cn('px-3 py-1.5', toneClass(implementationWeirdness))}>
            {implementationWeirdness} weirdness
          </Badge>
        </div>
        <p className="font-display text-2xl tracking-[-0.04em] text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function SelectTrapDemo() {
  const [comparisonPasses, setComparisonPasses] = React.useState(1)
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(properties[0].id)
  const selectedProperty = getProperty(selectedPropertyId)

  return (
    <Card className="glass-card rounded-md border border-border/60">
      <CardHeader>
        <Badge variant="outline">Problem 1</Badge>
        <CardTitle>The select only shows the label, not the decision</CardTitle>
        <CardDescription>
          The user only sees the name inside the chooser. The price, risk, occupancy, permits, and
          caveats arrive after the pick, so comparison becomes a guess first and a review second.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
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
                  <div className="px-3 py-2 text-sm leading-6 text-muted-foreground">
                    Price, risk, permits, timeline, and notes are invisible until after the pick.
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border/60 bg-secondary/70 px-4 py-4 text-sm leading-6 text-muted-foreground">
              Squeezing more text into the option label still does not create a real comparison
              surface. It just turns the menu into a noisy summary line.
            </div>
          </div>

          <div className="space-y-4">
            <Card className="rounded-md border border-border/60 bg-background shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{selectedProperty.label}</CardTitle>
                <CardDescription>
                  The meaningful detail lives outside the chooser, so the user compares one option
                  at a time and tries to remember the rest.
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
                    <div className="rounded-md bg-card px-4 py-3" key={label}>
                      <p className="text-sm font-medium text-muted-foreground">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{selectedProperty.note}</p>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Comparison passes', String(comparisonPasses)],
                ['Visible before select', '1'],
                ['Hidden before select', '5+'],
              ].map(([label, value]) => (
                <div className="rounded-md border border-border/60 bg-card px-4 py-4" key={label}>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="mt-2 font-display text-3xl tracking-[-0.04em] text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="glass-card rounded-md border border-border/60">
      <CardHeader>
        <Badge variant="outline">Problem 2</Badge>
        <CardTitle>The modal detour solves detail by stealing context</CardTitle>
        <CardDescription>
          A richer picker exists, but it now lives in a second focus trap. The comparison becomes a
          separate task instead of part of the workflow already in front of the user.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Dialog onOpenChange={setMemoDialogOpen} open={memoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                Open valuation memo
                <ArrowRight className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(96vw,900px)]">
              <DialogHeader>
                <DialogTitle>Prepare valuation memo</DialogTitle>
                <DialogDescription>
                  This is the real task. Opening another modal just to compare properties turns the
                  detour into part of the product.
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
                      The summary is useful, but the actual comparison happens somewhere else.
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
                            The rich list is now in a second layer instead of next to the memo that
                            needs it.
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
                                        <p className="text-sm font-medium text-muted-foreground">
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

          <div className="rounded-md border border-border/60 bg-background/70 px-4 py-4 text-sm leading-6 text-muted-foreground">
            Open the memo, then open the picker. The moment the second modal takes focus, the task
            underneath stops feeling local.
          </div>
        </div>

        <div className="grid gap-3">
          {[
            {
              body:
                memoDialogOpen && pickerOpen
                  ? 'The property picker owns focus now. The memo underneath still exists, but it is no longer the active context.'
                  : 'The richer detail is somewhere else, so the user has to context switch to compare.',
              label: 'Focus stack',
            },
            {
              body: 'The active modal makes the underlying layer inert, so keyboard flow and focus-return logic multiply.',
              label: 'Accessibility burden',
            },
            {
              body: 'Engineering work expands from choosing an option to coordinating two modal layers and the state between them.',
              label: 'Implementation drag',
            },
          ].map((item) => (
            <div className="rounded-md border border-border/60 bg-card px-4 py-4" key={item.label}>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PropertyRevealCard({
  onSelect,
  onSelectComplete,
  property,
  selectedPropertyId,
  scrollContainer,
}: {
  onSelect: (propertyId: string) => void
  onSelectComplete?: () => void
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
      className="overflow-hidden rounded-md border border-border/50 bg-card shadow-none"
      content={({ close, phase }) => (
        <MotionStage className="bg-card px-5 pb-5 pt-2" depth="micro" phase={phase}>
          <div className="space-y-4">
            <MotionItem>
              <PhaseStrip compact label="Card phase" />
            </MotionItem>
            <MotionItem>
              <div className="grid gap-3 sm:grid-cols-2">
                {property.attributes.map((attribute) => (
                  <div className="rounded-md bg-muted px-4 py-3" key={attribute.label}>
                    <p className="text-sm font-medium text-muted-foreground">{attribute.label}</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{attribute.value}</p>
                  </div>
                ))}
              </div>
            </MotionItem>
            <MotionItem>
              <p className="text-sm leading-6 text-muted-foreground">{property.note}</p>
            </MotionItem>
            <MotionItem>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => {
                    onSelect(property.id)
                    close({ restoreFocus: false })
                    onSelectComplete?.()
                  }}
                >
                  Select {property.label}
                </Button>
                <RevealClose asChild>
                  <Button variant="ghost">Keep comparing</Button>
                </RevealClose>
              </div>
            </MotionItem>
          </div>
        </MotionStage>
      )}
      keepMounted
      magicMotion
      onOpenChange={setIsOpen}
      ref={panelRef}
      restoreScrollOnClose
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
                <PanelPhaseBadge label="phase" />
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
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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

function InstallOptionPanel({
  command,
  description,
  isOpen,
  manager,
  onOpenChange,
}: (typeof installCommands)[number] & {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <RevealPanel
      className="w-full overflow-hidden rounded-md border border-border/50 bg-background/80 shadow-none"
      content={({ phase }) => (
        <MotionStage className="bg-background/95 px-4 pb-4 pt-2" depth="micro" phase={phase}>
          <div className="space-y-4">
            <MotionItem>
              <PhaseStrip compact label={`${manager} phase`} />
            </MotionItem>
            <MotionItem>
              <div className="space-y-2">
                <Label htmlFor={`${manager}-install-command`}>Install command</Label>
                <Input id={`${manager}-install-command`} readOnly value={command} />
              </div>
            </MotionItem>
            <MotionItem>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleCopy} size="sm">
                  {copied ? (
                    <>
                      Copied
                      <Check className="size-4" />
                    </>
                  ) : (
                    <>
                      Copy command
                      <Clipboard className="size-4" />
                    </>
                  )}
                </Button>
                <RevealClose asChild>
                  <Button size="sm" variant="ghost">
                    Hide
                  </Button>
                </RevealClose>
              </div>
            </MotionItem>
          </div>
        </MotionStage>
      )}
      keepMounted
      magicMotion
      onOpenChange={onOpenChange}
      open={isOpen}
      regionLabel={`${manager} install reveal`}
    >
      <RevealPanel.Top>
        <div className="bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <RevealTrigger asChild>
              <Button size="sm" variant="secondary">
                {manager}
              </Button>
            </RevealTrigger>
            <PanelPhaseBadge className="hidden sm:inline-flex" label="phase" />
          </div>
        </div>
      </RevealPanel.Top>
      <RevealPanel.Bottom>
        <div className="bg-secondary/70 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {description}
        </div>
      </RevealPanel.Bottom>
    </RevealPanel>
  )
}

function InstallChooser({ onCollapseAll }: { onCollapseAll: () => void }) {
  const [openManager, setOpenManager] = React.useState<string | null>(null)

  return (
    <Card className="glass-card rounded-md shadow-none">
      <CardHeader>
        <Badge variant="outline">Install reveal</Badge>
        <CardTitle>Pick a package manager</CardTitle>
        <CardDescription>Open one command, copy it, then hide it again.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="columns-1 gap-3 md:columns-2">
          {installCommands.map((item) => (
            <div className="mb-3 break-inside-avoid" key={item.manager}>
              <InstallOptionPanel
                {...item}
                isOpen={openManager === item.manager}
                onOpenChange={(nextOpen) => {
                  setOpenManager((current) =>
                    nextOpen ? item.manager : current === item.manager ? null : current,
                  )
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setOpenManager(null)
              onCollapseAll()
            }}
            size="sm"
            variant="outline"
          >
            Collapse all reveals
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RevealSolutionDemo({
  celebrated,
  onCollapseAll,
}: {
  celebrated: boolean
  onCollapseAll: () => void
}) {
  const [selectedPropertyId, setSelectedPropertyId] = React.useState('palm-residency')
  const selectedProperty = getProperty(selectedPropertyId)
  const chooserViewportRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-md bg-primary/5 shadow-none">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </div>
              <Badge className="px-3 py-1.5" variant="secondary">
                {celebrated ? 'Ta-da' : 'Reveal moment'}
              </Badge>
            </div>
            <p className="font-display text-2xl tracking-[-0.04em] text-foreground">
              This is the reveal solution you have been experiencing all along.
            </p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Persistent summary, inline comparison, and the install step all stay in the same
              place.
            </p>
          </div>
          <div className="rounded-md bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            Confetti fires once per page load.
          </div>
        </CardContent>
      </Card>

      <RevealPanel
        className="overflow-hidden rounded-md border border-border/50 bg-card"
        content={({ close, phase }) => (
          <MotionStage className="bg-card px-4 pb-4 pt-2 md:px-5" depth="inner" phase={phase}>
            <div className="space-y-4">
              <MotionItem>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <PhaseStrip label="Chooser lifecycle" />
                  <RevealClose asChild>
                    <Button size="sm" variant="ghost">
                      Collapse chooser
                    </Button>
                  </RevealClose>
                </div>
              </MotionItem>
              <MotionItem>
                <p className="rounded-md bg-background/70 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Open one property card at a time, inspect the detail inline, and keep the rest of
                  the task visible.
                </p>
              </MotionItem>
              <MotionItem>
                <ScrollArea
                  className="h-[25rem] rounded-md border border-border/60 bg-background"
                  viewportRef={chooserViewportRef}
                >
                  <RevealGroup closeSiblings>
                    <div className="space-y-3 p-4">
                      {properties.map((property) => (
                        <PropertyRevealCard
                          key={property.id}
                          onSelect={setSelectedPropertyId}
                          onSelectComplete={close}
                          property={property}
                          selectedPropertyId={selectedPropertyId}
                          scrollContainer={() => chooserViewportRef.current}
                        />
                      ))}
                    </div>
                  </RevealGroup>
                </ScrollArea>
              </MotionItem>
            </div>
          </MotionStage>
        )}
        keepMounted
        magicMotion
        regionLabel="Inline property chooser"
        restoreScrollOnClose
        scrollOffset={stickyHeaderScrollOffset}
        scrollOnOpen
      >
        <RevealPanel.Top>
          <div className="bg-card px-4 py-4 md:px-5 md:py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge variant="secondary">Solution</Badge>
                <div>
                  <h3 className="font-display text-3xl tracking-[-0.04em] text-foreground">
                    Browse the real choice inline
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Open the chooser without leaving the workflow the user was already in.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <PanelPhaseBadge label="panel" />
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <RevealTrigger asChild>
                    <Button size="lg">
                      Open inline chooser
                      <ArrowRight className="size-4" />
                    </Button>
                  </RevealTrigger>
                </div>
              </div>
            </div>
          </div>
        </RevealPanel.Top>

        <RevealPanel.Bottom>
          <div className="bg-secondary px-4 py-4 md:px-5">
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

      <InstallChooser onCollapseAll={onCollapseAll} />
    </div>
  )
}

function HeroLabReveal({
  celebrated,
  onBack,
  onClose,
  onCelebrate,
}: {
  celebrated: boolean
  onBack: () => void
  onClose: () => void
  onCelebrate: () => void
}) {
  const [activeTab, setActiveTab] = React.useState<LabTab>('select')
  const { phase } = useRevealPanelState()
  const prefersReducedMotion = usePrefersReducedMotion()
  const confettiFiredRef = React.useRef(false)

  React.useEffect(() => {
    if (activeTab !== 'reveal' || celebrated) return

    onCelebrate()

    if (prefersReducedMotion || confettiFiredRef.current || typeof window === 'undefined') {
      return
    }

    confettiFiredRef.current = true
    window.requestAnimationFrame(() => {
      confetti({
        angle: 65,
        origin: { x: 0.2, y: 0.7 },
        particleCount: 80,
        spread: 70,
      })
      confetti({
        angle: 115,
        origin: { x: 0.8, y: 0.7 },
        particleCount: 80,
        spread: 70,
      })
    })
  }, [activeTab, celebrated, onCelebrate, prefersReducedMotion])

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      initial={{
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.985,
        y: prefersReducedMotion ? 0 : 18,
      }}
      transition={
        prefersReducedMotion ? { duration: 0.18 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div className="space-y-5">
        <MotionItem>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="secondary">Layer two</Badge>
              <div>
                <h3 className="font-display text-3xl tracking-[-0.04em] text-foreground">
                  Visualize the pain
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  The same chooser problem played three ways: cramped select, modal detour, inline
                  reveal.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={onBack} size="sm" variant="ghost">
                Back
              </Button>
              <Button onClick={onClose} size="sm" variant="outline">
                Close
              </Button>
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="space-y-3">
            <PhaseStrip label="Lab lifecycle" />
            <p className="text-sm leading-6 text-muted-foreground">
              These panels read the real parent reveal phase: {phase}.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <Tabs
            className="space-y-6"
            onValueChange={(value) => setActiveTab(value as LabTab)}
            value={activeTab}
          >
            <TabsList className="w-full justify-start">
              <TabsTrigger value="select">Select trap</TabsTrigger>
              <TabsTrigger value="modal">Nested modal detour</TabsTrigger>
              <TabsTrigger value="reveal">Reveal solution</TabsTrigger>
            </TabsList>
          </Tabs>
        </MotionItem>

        <MotionItem>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
            key={activeTab}
            transition={
              prefersReducedMotion
                ? { duration: 0.16 }
                : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {activeTab === 'select' ? (
              <SelectTrapDemo />
            ) : activeTab === 'modal' ? (
              <ModalDetourDemo />
            ) : (
              <RevealSolutionDemo celebrated={celebrated} onCollapseAll={onClose} />
            )}
          </motion.div>
        </MotionItem>
      </div>
    </motion.div>
  )
}

function HeroRevealExperience() {
  const [labOpen, setLabOpen] = React.useState(false)
  const [celebrated, setCelebrated] = React.useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <RevealPanel
      className="hero-frame overflow-hidden"
      content={({ close, phase }) => (
        <MotionStage className="bg-card/95 px-4 pb-5 pt-2 md:px-6" depth="outer" phase={phase}>
          <div className="space-y-5">
            <ScrollOnRevealAnchor offset={stickyHeaderScrollOffset} phase={phase} restoreOnClose />
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
              key={labOpen ? 'lab' : 'patterns'}
              transition={
                prefersReducedMotion
                  ? { duration: 0.18 }
                  : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
              }
            >
              {labOpen ? (
                <HeroLabReveal
                  celebrated={celebrated}
                  onBack={() => setLabOpen(false)}
                  onCelebrate={() => setCelebrated(true)}
                  onClose={() => {
                    setLabOpen(false)
                  }}
                />
              ) : (
                <div className="space-y-5">
                  <MotionItem>
                    <div className="space-y-3">
                      <PhaseStrip label="Hero reveal lifecycle" />
                      <p className="text-sm leading-6 text-muted-foreground">
                        One stage at a time. The reveal below is driven by the real panel phase
                        rather than a separate demo state.
                      </p>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="space-y-2">
                      <Badge variant="outline">Layer one</Badge>
                      <h2 className="font-display text-4xl tracking-[-0.04em] text-foreground md:text-5xl">
                        Three patterns, three different costs
                      </h2>
                      <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                        Start with the tradeoff map, then open one deeper layer to feel the problem.
                      </p>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="grid gap-3 lg:grid-cols-3">
                      {pressureCards.map((card) => (
                        <PressureMiniCard key={card.title} {...card} />
                      ))}
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button onClick={() => setLabOpen(true)} size="lg">
                        Visualize the pain
                        <ArrowRight className="size-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          close()
                        }}
                        size="lg"
                        variant="ghost"
                      >
                        Close
                      </Button>
                    </div>
                  </MotionItem>
                </div>
              )}
            </motion.div>
          </div>
        </MotionStage>
      )}
      keepMounted
      magicMotion
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setLabOpen(false)
        }
      }}
      regionLabel="Hero product reveal"
    >
      <RevealPanel.Top>
        <div className="hero-spotlight rounded-t-[1rem] px-4 py-7 md:px-8 md:py-10">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <div className="space-y-5">
              <h1 className="font-display text-5xl tracking-[-0.06em] text-foreground text-balance md:text-7xl">
                Show the choice,
                <span className="text-primary"> not just the option label.</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                `reveal-ui` is a React library for persistent-summary disclosure. It is built for
                the moments where a select is too cramped and a second modal is too disruptive,
                especially when a user needs multiple attributes before choosing a property, record,
                plan, or configuration.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <RevealTrigger asChild>
                <Button size="lg">
                  Try it out
                  <ArrowRight className="size-4" />
                </Button>
              </RevealTrigger>
              <Button asChild size="lg" variant="outline">
                <a href="#docs">Read the quick API context</a>
              </Button>
            </div>
          </div>
        </div>
      </RevealPanel.Top>

      <RevealPanel.Bottom>
        <div className="rounded-b-[1rem] bg-secondary/80 px-4 py-5 md:px-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {heroSignals.map((item) => (
              <HeroSignalCard key={item.label} {...item} />
            ))}
          </div>
        </div>
      </RevealPanel.Bottom>
    </RevealPanel>
  )
}

export function ShowcasePage() {
  const [activeSection, setActiveSection] =
    React.useState<(typeof navigationItems)[number]['id']>('docs')
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
        rootMargin: '-20% 0px -55% 0px',
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
                    Jump to the docs, the FAQ, or the repository from mobile.
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
                      <a href="#overview">Hero demo</a>
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
              <a href="#docs">Docs</a>
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
          <HeroRevealExperience />
        </section>

        <section className="section-shell" id="docs">
          <DocsExperience />
        </section>

        <section className="section-shell pt-0">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-8">
              <SectionHeading
                description="The framing on the page is backed by guidance on select controls, modal dialogs, and search discoverability rather than vague UX folklore."
                kicker="Research"
                title="Research notes behind the framing"
              />
            </div>

            <Card className="glass-card rounded-md border border-border/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BrainCircuit className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Source material</CardTitle>
                    <CardDescription>
                      Direct references behind the copy choices and framing.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {researchLinks.map((item) => (
                  <a
                    className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card px-4 py-4 text-sm font-semibold leading-6 text-foreground transition-colors hover:bg-accent"
                    href={item.href}
                    key={item.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>{item.label}</span>
                    <ExternalLink
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                  </a>
                ))}
              </CardContent>
            </Card>
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
        <Card className="glass-card rounded-md border border-border/60">
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
                  <a href="#overview">Replay the hero reveal</a>
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
                <div className="rounded-md border border-border/60 bg-card p-5" key={item.label}>
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            <Separator />

            <p className="text-center text-sm leading-6 text-muted-foreground">
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
