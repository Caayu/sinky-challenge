import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '../globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans'
})
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono'
})

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: {
      default: t('title'),
      template: t('template')
    },
    description: t('description')
  }
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 container mx-auto p-4 md:p-8">{children}</main>
            </div>
            <Toaster richColors position="top-right" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
