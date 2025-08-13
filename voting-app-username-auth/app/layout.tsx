
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cloud Voting App',
  description: 'Username-password voting app on Firebase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  )
}
