import { SiteFooter } from '@/components/site/layout/site-footer'
import { SiteHeader } from '@/components/site/layout/site-header'

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
