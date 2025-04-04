import { PublicKey } from '@solana/web3.js';

// Configuration principale
export const config = {
  // Configuration Solana
  solana: {
    rpcUrl: 'https://api.devnet.solana.com',
    alternativeRpcUrls: [
      'https://solana-devnet-rpc.publicnode.com',
      'https://api.devnet.solana.com',
      'https://devnet.genesysgo.net'
    ],
    retryDelayMs: 1000,  // Délai plus important pour éviter les erreurs 429
    maxRetries: 5,
    retryMultiplier: 2,  // Augmentation plus agressive du délai
    adminWalletAddress: '79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy',
    wsUrl: "wss://api.devnet.solana.com",
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID || 'CCV4MnQ75r8ZY7n1ijtRkEv9MGdvkfZAYy23ggtYMf5r',
    network: process.env.NEXT_PUBLIC_NETWORK || 'devnet', // 'devnet', 'mainnet-beta'
    commitment: process.env.NEXT_PUBLIC_SOLANA_COMMITMENT || 'confirmed', // 'processed', 'confirmed', 'finalized'
  },

  // Configuration de l'application
  app: {
    name: 'AlyraSign',
    description: 'Application de signature de documents sur Solana',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },

  // Configuration des signatures
  signature: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSignaturesPerDocument: 10,
    signatureExpirationDays: 30,
  },

  // Configuration des formations
  formation: {
    maxParticipants: 50,
    maxSessionsPerFormation: 10,
    defaultSessionDuration: 120, // minutes
  },

  // Configuration de l'interface utilisateur
  ui: {
    theme: process.env.NEXT_PUBLIC_UI_THEME || 'light', // 'light', 'dark'
    language: process.env.NEXT_PUBLIC_UI_LANGUAGE || 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },

  // Configuration de la sécurité
  security: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 3,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Configuration des notifications
  notifications: {
    emailEnabled: process.env.NEXT_PUBLIC_EMAIL_NOTIFICATIONS === 'true',
    pushEnabled: process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS === 'true',
    defaultEmailFrom: process.env.NEXT_PUBLIC_EMAIL_FROM || 'noreply@alyrasign.com',
  },

  // Configuration du stockage
  storage: {
    type: process.env.NEXT_PUBLIC_STORAGE_TYPE || 'local', // 'local', 's3', 'ipfs'
    ipfsGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
    s3Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
  },
} as const;

// Types pour la configuration
export type Config = typeof config;

/**
 * Validations et utilitaires pour la configuration
 */

/**
 * Obtient l'adresse du wallet administrateur sous forme de PublicKey
 * @returns PublicKey validée de l'administrateur
 * @throws Error si l'adresse n'est pas valide
 */
export function getAdminPublicKey(): PublicKey {
  try {
    // Vérifier que l'adresse admin est définie
    if (!config.solana.adminWalletAddress) {
      throw new Error("L'adresse du wallet administrateur n'est pas définie dans la configuration");
    }
    
    // Créer et valider la PublicKey
    const adminPublicKey = new PublicKey(config.solana.adminWalletAddress);
    return adminPublicKey;
  } catch (error) {
    console.error("Erreur lors de la conversion de l'adresse admin en PublicKey:", error);
    throw new Error(`Adresse administrateur invalide: ${config.solana.adminWalletAddress}`);
  }
}

/**
 * Vérifie si une PublicKey correspond à celle de l'administrateur
 * @param publicKey PublicKey à vérifier
 * @returns true si la clé correspond à l'administrateur, false sinon
 */
export function isAdminWallet(publicKey: PublicKey | null | undefined): boolean {
  if (!publicKey) return false;
  
  try {
    const adminKey = getAdminPublicKey();
    return publicKey.equals(adminKey);
  } catch (error) {
    console.error("Erreur lors de la vérification du wallet admin:", error);
    return false;
  }
}

/**
 * Obtient l'ID du programme sous forme de PublicKey
 * @returns PublicKey validée du programme
 * @throws Error si l'ID n'est pas valide
 */
export function getProgramId(): PublicKey {
  try {
    // Vérifier que l'ID du programme est défini
    if (!config.solana.programId) {
      throw new Error("L'ID du programme n'est pas défini dans la configuration");
    }
    
    // Créer et valider la PublicKey
    const programId = new PublicKey(config.solana.programId);
    return programId;
  } catch (error) {
    console.error("Erreur lors de la conversion de l'ID du programme en PublicKey:", error);
    throw new Error(`ID de programme invalide: ${config.solana.programId}`);
  }
} 