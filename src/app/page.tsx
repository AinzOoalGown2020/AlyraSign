'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  fetchAllPolls,
  getCounter,
  getProvider,
  getReadonlyProvider,
  initialize,
} from '../app/services/blockchain.service'
import Link from 'next/link'
import { Poll } from './utils/interfaces'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { config } from '@/config/param.config'

export default function Home() {
  const router = useRouter()
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const programReadOnly = useMemo(() => getReadonlyProvider(), [])

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const fetchData = useCallback(async () => {
    fetchAllPolls(programReadOnly).then((data) => setPolls(data as any))
    const count = await getCounter(programReadOnly)
    setIsInitialized(count.toNumber() >= 0)
  }, [programReadOnly])

  useEffect(() => {
    if (!programReadOnly) return
    fetchData()
  }, [programReadOnly, fetchData])

  useEffect(() => {
    if (publicKey) {
      const isAdmin = publicKey.toBase58() === config.solana.adminWalletAddress
      router.push(isAdmin ? '/admin' : '/student')
    }
  }, [publicKey, router])

  const handleInit = async () => {
    if (isInitialized && !!publicKey) return

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await initialize(program!, publicKey!)
          console.log(tx)

          await fetchData()
          resolve(tx as any)
        } catch (error) {
          console.error('Transaction failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Bienvenue sur AlyraSign
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Application de gestion des présences pour les étudiants
        </p>
        <div className="space-y-4">
          <WalletMultiButton />
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
