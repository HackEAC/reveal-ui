'use client'

import * as React from 'react'
import { RevealClose, RevealPanel, RevealTrigger } from 'reveal-ui'
import { Button } from '@/components/ui/button'
import { type ComparisonPlanId, comparisonPlans } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

export function PlanComparisonDemo() {
  const [selectedPlanId, setSelectedPlanId] = React.useState<ComparisonPlanId>('team')
  const selectedPlan =
    comparisonPlans.find((plan) => plan.id === selectedPlanId) ?? comparisonPlans[1]

  return (
    <article className="surface-panel overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <p className="section-label">Plan comparison</p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">
          Show the tradeoff, not just the label
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use reveal when rollout, fit, and caveats matter before the decision is real.
        </p>
      </div>

      <RevealPanel
        className="overflow-hidden"
        content={({ close }) => (
          <div className="space-y-3 border-t border-border px-5 py-4">
            {comparisonPlans.map((plan) => (
              <button
                className={cn(
                  'w-full rounded-md border px-4 py-4 text-left transition-colors',
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{plan.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.fit}</p>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-foreground">
                    {plan.price}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {plan.rollout} · {plan.note}
                </p>
              </button>
            ))}
          </div>
        )}
        keepMounted
        regionLabel="Plan comparison example"
      >
        <RevealPanel.Top>
          <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Current recommendation: {selectedPlan.label}
                </p>
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
          <div className="border-t border-border bg-secondary/40 px-5 py-3 text-sm leading-6 text-muted-foreground">
            {selectedPlan.price} · {selectedPlan.rollout}
          </div>
        </RevealPanel.Bottom>
      </RevealPanel>
    </article>
  )
}
