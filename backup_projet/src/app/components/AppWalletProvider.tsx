'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import { config } from '@/config/param.config';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => config.solana.rpcUrl, []);
  
  // Utiliser des instances de wallet explicites au lieu de dépendre des standard wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter({network}),
    new SolflareWalletAdapter({network})
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true}
        localStorageKey="alyraSigner"
        onError={(error) => {
          console.error("Erreur du wallet adapter:", error);
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 