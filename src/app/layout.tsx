import type { Metadata } from 'next'
import { Noto_Sans_SC  } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers";

const noto = Noto_Sans_SC ({
  display: 'swap',
  adjustFontFallback: false,
  subsets:['latin'],
})

export const metadata: Metadata = {
  title: 'ScriptHub - 在线生成脚本',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-cn" suppressHydrationWarning>
      <head>
      </head>
      <body  className={`${noto.className}`}>
        <Providers>
          <main >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
