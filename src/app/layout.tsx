import './utils/polyfills'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Inter } from 'next/font/google'
import { WalletContextProvider } from './context/WalletContextProvider'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <WalletContextProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <ToastContainer position="bottom-center" />
        </WalletContextProvider>
      </body>
    </html>
  )
}
