import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})

export const metadata = {
  title: 'Encontro de Família',
  description: 'Fotos, bingo, rifa e inscrição para o nosso encontro de família.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${inter.variable} font-body bg-paper text-ink`}>
        {children}
      </body>
    </html>
  )
}
