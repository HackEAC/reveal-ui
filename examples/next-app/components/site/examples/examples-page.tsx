import Link from 'next/link'
import { InlineEditorDemo } from '@/components/site/examples/inline-editor-demo'
import { NestedFlowDemo } from '@/components/site/examples/nested-flow-demo'
import { PlanComparisonDemo } from '@/components/site/examples/plan-comparison-demo'
import { PageFrame } from '@/components/site/layout/page-frame'
import { Button } from '@/components/ui/button'

export function ExamplesPage() {
  return (
    <PageFrame>
      <section className="page-section page-shell space-y-10">
        <div className="max-w-2xl space-y-4">
          <p className="section-label">Examples</p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
            Production-shaped patterns
          </h1>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            Three small demos that show where persistent-summary disclosure earns its place: inline
            editing, plan comparison, and nested flows without modal chains.
          </p>
          <Button asChild variant="outline">
            <Link href="/docs">Open API reference</Link>
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <InlineEditorDemo />
          <PlanComparisonDemo />
          <NestedFlowDemo />
        </div>
      </section>
    </PageFrame>
  )
}
