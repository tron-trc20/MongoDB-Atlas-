import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// 禁用静态生成，强制使用服务器端渲染
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '支付宝口令红包',
  description: '支付宝口令红包自助购买平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
} 