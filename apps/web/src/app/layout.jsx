import Header from '@/components/layout/Header/Header'
import { Noto_Sans_KR } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Providers from './providers'

const notoSansKR = Noto_Sans_KR({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

const baskinRobbins = localFont({
  src: '../assets/fonts/baskin-robbins-b.otf',
  variable: '--font-baskin-robbins',
  display: 'swap',
})

export const metadata = {
  title: 'Matdori Market',
  description: 'Find and share delicious recipes.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} ${baskinRobbins.variable}`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
