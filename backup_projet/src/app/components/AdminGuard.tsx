'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { isAdminWallet } from '@/config/param.config';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!publicKey || !isAdminWallet(publicKey)) {
      router.push('/');
    }
  }, [publicKey, router]);

  if (!publicKey || !isAdminWallet(publicKey)) {
    return null;
  }

  return <>{children}</>;
} 