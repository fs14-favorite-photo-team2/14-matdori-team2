import './globals.css'

export const metadata = {
  title: 'Matdori Market',
  description: 'Find and share delicious recipes.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
