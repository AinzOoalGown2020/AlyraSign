'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Connection } from '@solana/web3.js';
import { config } from '@/config/param.config';

// Import des styles du wallet adapter
require('@solana/wallet-adapter-react-ui/styles.css');

interface Props {
  children: ReactNode;
}

type NetworkType = WalletAdapterNetwork;

export const WalletContextProvider: FC<Props> = ({ children }) => {
  const network = config.solana.network as NetworkType;
  
  const endpoint = useMemo(() => {
    return config.solana.rpcUrl;
  }, []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({network}),
      new SolflareWalletAdapter({network}),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true}
        localStorageKey="alyraSigner"
        onError={(error) => {
          console.error("Erreur du wallet adapter dans WalletContextProvider:", error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 