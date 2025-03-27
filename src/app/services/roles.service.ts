import { PublicKey } from '@solana/web3.js';

// Liste des adresses des administrateurs (à remplacer par les vraies adresses)
const ADMIN_WALLETS = [
  'VOTRE_ADRESSE_ADMIN_1',
  'VOTRE_ADRESSE_ADMIN_2',
];

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

export const getUserRole = (publicKey: PublicKey | null): UserRole => {
  if (!publicKey) return UserRole.STUDENT;
  
  const walletAddress = publicKey.toString();
  return ADMIN_WALLETS.includes(walletAddress) 
    ? UserRole.ADMIN 
    : UserRole.STUDENT;
};

export const isAdmin = (publicKey: PublicKey | null): boolean => {
  return getUserRole(publicKey) === UserRole.ADMIN;
}; 