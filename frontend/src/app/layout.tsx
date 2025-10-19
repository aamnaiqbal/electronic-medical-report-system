import './globals.css'
import { Inter } from 'next/font/google'
import ReduxProvider from '@/lib/redux/ReduxProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import Toast from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Electronic Medical Report',
  description: 'Secure healthcare management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <AuthProvider>
            {children}
            <Toast />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
