'use client'

import { Check, Copy } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { RevealPanel, RevealTrigger } from 'reveal-ui'
import { Button } from '@/components/ui/button'
import { type ComparisonPlanId, comparisonPlans } from '@/lib/demo-data'
import { siteConfig } from '@/lib/site'
import { cn } from '@/lib/utils'

export function HeroDemo() {
  const [selectedPlanId, setSelectedPlanId] = React.useState<ComparisonPlanId>('team')
  const [copied, setCopied] = React.useState(false)
  const selectedPlan =
    comparisonPlans.find((plan) => plan.id === selectedPlanId) ?? comparisonPlans[1]

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copyInstallCommand() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(siteConfig.installCommand)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="section-label">React disclosure primitive</p>
          <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Keep the summary visible while detail opens inline.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
            Built for choosers, editors, and nested flows where a select label is not enough and a
            second modal breaks context.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/docs">Read the docs</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/examples">View examples</Link>
          </Button>
        </div>

        <div className="surface-panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <code className="font-mono text-sm text-foreground">{siteConfig.installCommand}</code>
            <Button onClick={copyInstallCommand} size="sm" variant="secondary">
              {copied ? (
                <>
                  Copied
                  <Check className="size-4" />
                </>
              ) : (
                <>
                  Copy
                  <Copy className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <RevealPanel
        className="surface-panel overflow-hidden"
        content={({ close }) => (
          <div className="space-y-3 border-t border-border px-4 py-4">
            {comparisonPlans.map((plan) => (
              <button
                className={cn(
                  'w-full rounded-md border px-4 py-3 text-left transition-colors',
                  plan.id === selectedPlanId
                    ? 'border-accent/40 bg-accent/10'
                    : 'border-border bg-background hover:bg-secondary/60',
                )}
                key={plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id)
                  close()
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{plan.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.fit}</p>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-foreground">
                    {plan.price}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {plan.rollout} · {plan.note}
                </p>
              </button>
            ))}
          </div>
        )}
        keepMounted
        magicMotion
        regionLabel="Plan comparison demo"
      >
        <RevealPanel.Top>
          <div className="px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Current plan</p>
                <p className="text-sm leading-6 text-muted-foreground">{selectedPlan.fit}</p>
              </div>
              <RevealTrigger asChild>
                <Button size="sm" variant="secondary">
                  Compare plans
                </Button>
              </RevealTrigger>
            </div>
          </div>
        </RevealPanel.Top>

        <RevealPanel.Bottom>
          <div className="border-t border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
            {selectedPlan.label} · {selectedPlan.price} · {selectedPlan.rollout}
          </div>
        </RevealPanel.Bottom>
      </RevealPanel>
    </div>
  )
}
