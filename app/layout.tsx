import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { NavBar } from '@/components/nav-bar'
import { SessionProvider } from 'next-auth/react'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'NextChat',
  description: 'Real-time chat application built with Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <NavBar />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
