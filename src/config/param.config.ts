export const config = {
  // Configuration Solana
  solana: {
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'http://127.0.0.1:8899',
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID || '5efYRoL5mJVBmnJCwTtEmtErLyMSAjjh3BW3ra2quKCP',
    adminWalletAddress: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || '79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy',
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'localnet', // 'localnet', 'devnet', 'mainnet-beta'
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