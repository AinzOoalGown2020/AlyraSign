'use client'

import './globals.css'
import AppWalletProvider from './components/AppWalletProvider'
import { ReactQueryProvider } from './react-query-provider'
import Header from './components/Header'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { store } from './store'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { WalletContextProvider } from './context/WalletContextProvider'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AlyraSign - Gestion des Présences',
  description: 'Application de gestion des présences pour les étudiants',
}

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
        </WalletContextProvider>
      </body>
    </html>
  )
}
