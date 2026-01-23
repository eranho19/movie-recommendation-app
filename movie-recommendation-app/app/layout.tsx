import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}








