import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { useMemo } from 'react';
import { IDL } from '../../idl/alyra_sign';

export const PROGRAM_ID = new web3.PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'VOTRE_PROGRAM_ID'
);

export function useSolana() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );

    return new Program(IDL, PROGRAM_ID, provider);
  }, [connection, wallet]);

  return {
    connection,
    program,
    wallet,
  };
} 