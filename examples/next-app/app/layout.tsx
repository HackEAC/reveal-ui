import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reveal UI Example',
  description: 'Persistent-summary disclosure example using @mijengo/reveal-ui',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
