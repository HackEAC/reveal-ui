'use client'

import * as React from 'react'
import { RevealClose, RevealPanel, RevealTrigger } from 'reveal-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NestedFlowDemo() {
  const [approvalRoute, setApprovalRoute] = React.useState('Risk review first')

  return (
    <article className="surface-panel overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <p className="section-label">Nested flow</p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">
          Close the inner step or the whole chain
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Open a deeper step only when needed, then close it locally or propagate completion
          outward.
        </p>
      </div>

      <RevealPanel
        className="overflow-hidden"
        content={() => (
          <div className="space-y-4 border-t border-border px-5 py-4">
            <p className="text-sm leading-6 text-muted-foreground">
              The outer workflow stays visible while the deeper approval step opens only when the
              user asks for it.
            </p>

            <RevealPanel
              className="overflow-hidden rounded-md border border-border bg-background"
              content={({ close }) => (
                <div className="space-y-3 border-t border-border px-4 py-4">
                  {['Risk review first', 'Legal review first', 'Ops sign-off only'].map((route) => (
                    <button
                      className={cn(
                        'w-full rounded-md border px-3 py-3 text-left text-sm transition-colors',
                        route === approvalRoute
                          ? 'border-accent/40 bg-accent/10 text-foreground'
                          : 'border-border hover:bg-secondary/60',
                      )}
                      key={route}
                      onClick={() => setApprovalRoute(route)}
                      type="button"
                    >
                      {route}
                    </button>
                  ))}

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button onClick={() => close()} size="sm" variant="outline">
                      Save nested step
                    </Button>
                    <Button onClick={() => close({ propagate: true })} size="sm">
                      Save and close all
                    </Button>
                  </div>
                </div>
              )}
              keepMounted
              regionLabel="Nested approval route example"
            >
              <RevealPanel.Top>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Approval route</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {approvalRoute}
                      </p>
                    </div>
                    <RevealTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Adjust route
                      </Button>
                    </RevealTrigger>
                  </div>
                </div>
              </RevealPanel.Top>

              <RevealPanel.Bottom>
                <div className="border-t border-border bg-secondary/40 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Use propagate to finish the inner step and collapse the parent flow in one action.
                </div>
              </RevealPanel.Bottom>
            </RevealPanel>

            <div className="flex justify-end">
              <RevealClose asChild>
                <Button size="sm" variant="ghost">
                  Done with access flow
                </Button>
              </RevealClose>
            </div>
          </div>
        )}
        keepMounted
        regionLabel="Nested flow example"
      >
        <RevealPanel.Top>
          <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Workspace access flow</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Current route: {approvalRoute}
                </p>
              </div>
              <RevealTrigger asChild>
                <Button size="sm">Manage access</Button>
              </RevealTrigger>
            </div>
          </div>
        </RevealPanel.Top>

        <RevealPanel.Bottom>
          <div className="border-t border-border bg-secondary/40 px-5 py-3 text-sm leading-6 text-muted-foreground">
            Summary, nested step, and completion action all live in one visible flow.
          </div>
        </RevealPanel.Bottom>
      </RevealPanel>
    </article>
  )
}
