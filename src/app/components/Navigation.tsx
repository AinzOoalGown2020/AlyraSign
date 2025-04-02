'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { config } from '@/config/param.config';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function Navigation() {
  const pathname = usePathname();
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isAdmin = publicKey?.toBase58() === config.solana.adminWalletAddress;
  const isAdminPage = pathname.startsWith('/admin');
  const isStudent = pathname.startsWith('/student');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = async () => {
    await disconnect();
    setIsMenuOpen(false);
  };

  const handleChangeWallet = () => {
    setVisible(true);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                AlyraSign
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/student"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isStudent
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Portail Étudiant
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isAdminPage && pathname === '/admin'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Administration
                  </Link>
                  <Link
                    href="/admin/students"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/admin/students'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Gestion Étudiants
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative">
              {mounted && (
                connected ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                    >
                      <span className="truncate max-w-[150px]">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </span>
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1" role="menu">
                          <button
                            onClick={handleChangeWallet}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Changer de wallet
                          </button>
                          <button
                            onClick={handleDisconnect}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Se déconnecter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 