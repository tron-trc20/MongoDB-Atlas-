import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// 添加动态配置，确保页面不被静态生成
export const dynamic = 'force-dynamic'
export const revalidate = 0

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