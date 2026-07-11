import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ThemeInjector } from '@/components/ThemeInjector'
import { connectDB } from '@/lib/db'
import SiteConfig from '@/lib/models/SiteConfig'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Unicorn, Your Buddy',
  description: 'Your personal mental health and well-being companion',
  icons: { icon: '/favicon.ico' },
}

async function getThemeCss(): Promise<string> {
  try {
    await connectDB()
    const configs = await SiteConfig.find({}).lean()
    if (!configs.length) return ''

    const cssVars: string[] = []
    let fontFamily = ''
    let fontSize = ''

    for (const c of configs) {
      if (c.key.startsWith('--')) {
        cssVars.push(`  ${c.key}: ${c.value};`)
      } else if (c.key === 'font-family') {
        fontFamily = c.value
      } else if (c.key === 'font-size-base') {
        fontSize = c.value
      }
    }

    const lines: string[] = []
    if (cssVars.length) {
      lines.push(`:root {\n${cssVars.join('\n')}\n}`)
    }
    if (fontFamily) {
      lines.push(`body { font-family: '${fontFamily}', sans-serif !important; }`)
    }
    if (fontSize) {
      lines.push(`html { font-size: ${fontSize}px !important; }`)
    }
    return lines.join('\n')
  } catch {
    return ''
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeCss = await getThemeCss()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeInjector css={themeCss} />
          {children}
        </Providers>
      </body>
    </html>
  )
}
