import { useConnection, useWallet, WalletContextState } from '@solana/wallet-adapter-react'
import { useCallback, useState } from 'react'
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionSignature, Commitment } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { IDL } from '@/idl/alyra_sign';
import { config } from '@/config/param.config';
import { store } from '../store'
import { globalActions } from '../store/globalSlices'
import { toast } from 'react-toastify'
import { AlyraSignContract } from '@/types/AlyraSign'
import { COUNTER_SEED } from '@/lib/constants'
import { web3 } from '@coral-xyz/anchor'
import BN from 'bn.js'


const RPC_URL = config.solana.rpcUrl;

let tx
const programId = new PublicKey(config.solana.programId)
const ALTERNATIVE_RPC_URLS = config.solana.alternativeRpcUrls || []
const RETRY_DELAY_MS = config.solana.retryDelayMs || 500
const MAX_RETRIES = config.solana.maxRetries || 3
const RETRY_MULTIPLIER = config.solana.retryMultiplier || 1.5

// IDL minimal pour le développement
export const minimalIdl = {
  "version": "0.1.0",
  "name": "alyrasign",
  "instructions": [
    {
      "name": "createStudentGroup",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "students",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "formations",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "addStudentsToGroup",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "students",
          "type": {
            "vec": "string"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "studentGroup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "students",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "formations",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    }
  ]
}

// Résout l'erreur de `sendTransaction`
interface ExtendedWallet extends Wallet {
  sendTransaction?: (transaction: Transaction, connection: Connection) => Promise<string>;
  signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>;
}

/**
 * Classe utilitaire pour gérer les connexions RPC avec résilience
 */
export class ResilientConnection {
  private connection: Connection;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 1000;
  private isTransactionPending: boolean = false;

  constructor() {
    // Créer la connexion RPC
    this.connection = new Connection(
      RPC_URL,
      { commitment: 'confirmed', confirmTransactionInitialTimeout: 60000 }
    );
    console.log("ResilientConnection initialisée avec", RPC_URL);
  }

  /**
   * Obtenir la connexion actuelle
   */
  public getCurrentConnection(): Connection {
    return this.connection;
  }

  /**
   * Attendre un délai spécifié
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exécuter une opération avec retry automatique
   */
  public async executeWithRetry<T>(
    operation: (connection: Connection) => Promise<T>
  ): Promise<T> {
    let error = null;
    
    // Marquer comme transaction en cours si c'est une transaction
    if (operation.toString().includes('sendRawTransaction') || 
        operation.toString().includes('confirmTransaction')) {
      this.isTransactionPending = true;
    }
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Exécuter l'opération
        const result = await operation(this.connection);
        this.retryCount = 0;
        this.isTransactionPending = false;
        return result;
      } catch (err: any) {
        error = err;
        
        // Si c'est une erreur liée à la signature
        if (err.toString().includes('signature') || 
            err.toString().includes('signer') || 
            err.toString().includes('AccountNotSigner')) {
          console.error("Erreur de signature, abandon:", err);
          throw err;
        }
        
        // Si c'est une erreur de taux limite ou de connexion, attendre et réessayer
        if (err.toString().includes('429') || 
            err.toString().includes('timeout') || 
            err.toString().includes('rate') ||
            err.toString().includes('fetch')) {
          
          const waitTime = this.retryDelay * Math.pow(2, attempt);
          console.log(`Tentative ${attempt + 1}/${this.maxRetries + 1} échouée. Nouvelle tentative dans ${waitTime}ms`);
          await this.delay(waitTime);
          this.retryCount++;
          continue;
        }
        
        // Pour les autres erreurs, simplement abandonner
        console.error("Erreur irrécupérable:", err);
        this.isTransactionPending = false;
        throw err;
      }
    }
    
    console.error(`Échec après ${this.maxRetries + 1} tentatives, abandon.`);
    this.isTransactionPending = false;
    throw error;
  }
}

// Créer une instance partagée
const resilientConnection = new ResilientConnection();

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | null,
  sendTransaction: ((transaction: Transaction, connection: Connection, options?: SendOptions) => Promise<string>) | null
): Program | null => {
  if (!publicKey || !signTransaction || !sendTransaction) return null

  const connection = new Connection(RPC_URL, 'confirmed')
  const wallet = {
    publicKey,
    signTransaction,
    signAllTransactions: async (transactions: Transaction[]) => {
      return Promise.all(transactions.map(tx => signTransaction(tx)))
    },
    sendTransaction: async (transaction: Transaction, connection: Connection, options?: SendOptions) => {
      // Assurez-vous que la transaction contient la signature du wallet
      const signedTx = await signTransaction(transaction);
      
      // Vérifiez les signatures avant d'envoyer
      console.log("Transaction préparée pour signature:", {
        signatures: transaction.signatures.map(s => ({
          publicKey: s.publicKey.toBase58(),
          signature: s.signature ? 'présente' : 'absente'
        }))
      });
      
      console.log("Transaction signée par le wallet:", {
        signatures: signedTx.signatures.map(s => ({
          publicKey: s.publicKey.toBase58(),
          signature: s.signature ? 'présente' : 'absente'
        }))
      });
      
      return sendTransaction(signedTx, connection, options);
    },
    payer: publicKey
  } as ExtendedWallet

  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
    skipPreflight: false
  })

  // S'assurer que le provider utilise le bon wallet
  provider.wallet = wallet;
  
  // Log pour vérifier que le provider est correctement configuré
  console.log("Provider créé avec wallet:", {
    publicKey: provider.wallet.publicKey.toBase58(),
    hasSendTransaction: !!provider.wallet.sendTransaction,
    hasSignTransaction: !!provider.wallet.signTransaction,
    hasSignAllTransactions: !!provider.wallet.signAllTransactions
  });

  return new Program(minimalIdl, programId, provider)
}

export const getReadonlyProvider = (): Program | null => {
  const connection = new Connection(RPC_URL, 'confirmed')
  const wallet = Keypair.generate()
  const provider = new AnchorProvider(connection, wallet as any, {
    preflightCommitment: 'confirmed',
  })

  return new Program(minimalIdl, programId, provider)
}

export const getCounter = async (program: Program): Promise<BN> => {
  try {
    const [counterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('counter')],
      programId
    )
    const counter = await program.account.counter.fetch(counterPda)
    return counter.count
  } catch (error) {
    console.log('Compteur non initialisé, retour de 0')
    return new BN(0)
  }
}

export const initialize = async (
  program: Program,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )

  tx = await program.methods
    .initialize()
    .accountsPartial({
      authority: publicKey,
      counter: counterPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}

export const getConnection = (network: string = 'devnet'): Connection => {
  console.log('Création d\'une connexion pour le réseau:', network);
  let endpoint: string;

  switch (network) {
    case 'mainnet-beta':
      endpoint = 'https://api.mainnet-beta.solana.com';
      break;
    case 'testnet':
      endpoint = 'https://api.testnet.solana.com';
      break;
    case 'devnet':
    default:
      endpoint = 'https://api.devnet.solana.com';
      break;
  }

  // Utiliser l'URL RPC spécifiée dans la configuration si disponible
  if (config.solana.rpcUrl) {
    endpoint = config.solana.rpcUrl;
  }

  console.log('Utilisation de l\'endpoint:', endpoint);
  return new Connection(endpoint, config.solana.commitment as Commitment);
};

// Créer un provider AnchorProvider avec un wallet adapter
export const createAnchorProvider = (wallet: WalletContextState, network: string = 'devnet'): AnchorProvider | null => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    console.warn('Wallet non initialisé ou méthodes de signature manquantes');
    return null;
  }

  // La connexion utilise le commitment level de la configuration
  const connection = getConnection(network);
  
  console.log('Création d\'un AnchorProvider avec:', {
    publicKey: wallet.publicKey.toBase58(),
    hasSignTransaction: !!wallet.signTransaction,
    hasSignAllTransactions: !!wallet.signAllTransactions,
    commitment: config.solana.commitment
  });
  
  // Créer un wrapper autour du wallet-adapter pour être compatible avec Anchor
  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  };
  
  // Configurer le provider avec les options appropriées
  const provider = new AnchorProvider(
    connection, 
    anchorWallet as any, 
    { 
      commitment: config.solana.commitment as Commitment,
      skipPreflight: true, // Désactiver les vérifications préliminaires pour éviter des rejets prématurés
      preflightCommitment: config.solana.commitment as Commitment,
    }
  );
  
  return provider;
};

// Ajouter cette fonction pour créer un programme avec signataire explicite
export const createProgramWithSigner = (
  publicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>
): Program => {
  try {
    console.log("Création d'un programme avec signataire explicite:", { publicKey: publicKey.toBase58() });
    
    // Vérifier que les paramètres requis sont présents
    if (!publicKey) {
      throw new Error("publicKey est requis pour créer un programme avec un signataire");
    }
    
    if (!signTransaction) {
      throw new Error("signTransaction est requis pour créer un programme avec un signataire");
    }

    const connection = resilientConnection.getCurrentConnection();
    
    // Créer un wallet minimal pour Anchor
    const wallet: Wallet = {
      publicKey: publicKey,
      signTransaction,
      signAllTransactions: signAllTransactions || (async (txs: Transaction[]) => {
        return Promise.all(txs.map(tx => signTransaction(tx)));
      })
    };
    
    // Créer le provider
    const provider = new AnchorProvider(connection, wallet, {
      skipPreflight: true,
      commitment: 'confirmed',
      preflightCommitment: 'confirmed'
    });
    
    console.log("Provider créé avec wallet signataire:", {
      walletPubkey: wallet.publicKey.toBase58()
    });
    
    // Créer le programme avec Anchor
    const programId = new PublicKey(config.solana.programId);
    const program = new Program(IDL, programId, provider);
    
    // Vérifier que le programme a bien toutes les méthodes nécessaires
    console.log("Programme créé avec méthodes:", Object.keys(program.methods));
    
    if (!program.methods.createStudentGroup) {
      console.error("ERREUR: Le programme n'a pas de méthode createStudentGroup!");
      console.error("IDL methods:", Object.keys(program.methods));
    }
    
    return program;
  } catch (error) {
    console.error("Erreur lors de la création du programme:", error);
    throw error;
  }
};

// Exporter la connexion résiliente
export { resilientConnection };
