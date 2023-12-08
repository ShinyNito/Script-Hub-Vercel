import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers";

const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'ScriptHub - 在线生成脚本',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-cn" className='h-full'>
      <body className={inter.className + ` h-full `}>
        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  )
}
