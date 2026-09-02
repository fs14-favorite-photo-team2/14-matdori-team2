import { Noto_Sans_KR } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

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
        {children}
      </body>
    </html>
  )
}
