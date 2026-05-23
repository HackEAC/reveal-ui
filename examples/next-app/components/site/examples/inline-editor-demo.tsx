'use client'

import * as React from 'react'
import { RevealClose, RevealPanel, RevealTrigger } from 'reveal-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function InlineEditorDemo() {
  const [profile, setProfile] = React.useState({
    name: 'Northshore Ops',
    notes: 'Escalate only when the target workspace has pending legal review.',
  })
  const [draftName, setDraftName] = React.useState(profile.name)
  const [draftNotes, setDraftNotes] = React.useState(profile.notes)

  return (
    <article className="surface-panel overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <p className="section-label">Inline editor</p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">
          Edit without replacing the summary
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          A richer form opens inline while the summary and downstream context stay visible.
        </p>
      </div>

      <RevealPanel
        className="overflow-hidden"
        content={({ close }) => (
          <div className="space-y-4 border-t border-border px-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="inline-editor-name">Workspace label</Label>
              <Input
                id="inline-editor-name"
                onChange={(event) => setDraftName(event.target.value)}
                value={draftName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inline-editor-notes">Review note</Label>
              <Textarea
                id="inline-editor-notes"
                onChange={(event) => setDraftNotes(event.target.value)}
                rows={4}
                value={draftNotes}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <RevealClose asChild>
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
              </RevealClose>
              <Button
                onClick={() => {
                  setProfile({ name: draftName, notes: draftNotes })
                  close()
                }}
                size="sm"
              >
                Save summary
              </Button>
            </div>
          </div>
        )}
        keepMounted
        onOpenChange={(nextOpen) => {
          if (!nextOpen) return
          setDraftName(profile.name)
          setDraftNotes(profile.notes)
        }}
        regionLabel="Inline editor example"
      >
        <RevealPanel.Top>
          <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{profile.name}</p>
                <p className="text-sm leading-6 text-muted-foreground">{profile.notes}</p>
              </div>
              <RevealTrigger asChild>
                <Button size="sm">Edit</Button>
              </RevealTrigger>
            </div>
          </div>
        </RevealPanel.Top>

        <RevealPanel.Bottom>
          <div className="border-t border-border bg-secondary/40 px-5 py-3 text-sm leading-6 text-muted-foreground">
            Footer context stays visible: next sync in 2 minutes, legal review optional.
          </div>
        </RevealPanel.Bottom>
      </RevealPanel>
    </article>
  )
}
