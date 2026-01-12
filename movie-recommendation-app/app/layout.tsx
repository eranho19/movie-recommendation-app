import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Let Me Set You Up - Movie Recommendations',
  description: 'Discover your next favorite movie with personalized recommendations',
  keywords: ['movies', 'recommendations', 'IMDB', 'Rotten Tomatoes', 'film'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}








