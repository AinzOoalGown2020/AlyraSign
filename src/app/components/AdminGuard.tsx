'use client';

import { FC, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { config } from '@/config/param.config';

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard: FC<AdminGuardProps> = ({ children }) => {
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!publicKey || publicKey.toString() !== config.solana.adminWalletAddress) {
      router.push('/student');
    }
  }, [publicKey, router]);

  if (!publicKey || publicKey.toString() !== config.solana.adminWalletAddress) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Accès Non Autorisé</h1>
        <p className="text-gray-600 mb-4">Vous n&apos;avez pas les droits d&apos;administrateur.</p>
        <button
          onClick={() => router.push('/student')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return <>{children}</>;
}; 