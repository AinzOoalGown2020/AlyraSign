'use client';

import { FC, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { isAdmin } from '../services/roles.service';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard: FC<AdminGuardProps> = ({ children }) => {
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (publicKey && !isAdmin(publicKey)) {
      router.push('/student');
    }
  }, [publicKey, router]);

  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Accès Administrateur Requis</h1>
        <WalletMultiButton />
      </div>
    );
  }

  if (!isAdmin(publicKey)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Accès Non Autorisé</h1>
        <p className="text-gray-600 mb-4">Vous n&apos;avez pas les droits d&apos;accès nécessaires pour accéder à cette page.</p>
        <button
          onClick={() => router.push('/student')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Retour au Portail Étudiant
        </button>
      </div>
    );
  }

  return <>{children}</>;
}; 