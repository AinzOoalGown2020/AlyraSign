import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { IDL } from '@/idl/alyra_sign';
import { config } from '@/config/param.config';

const RPC_URL = config.solana.rpcUrl;

/**
 * Classe simple pour gérer les connexions RPC avec résilience
 */
export class SimpleConnection {
  private connection: Connection;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 1000;

  constructor() {
    // Créer la connexion RPC avec un timeout élevé
    this.connection = new Connection(
      RPC_URL,
      { commitment: 'confirmed', confirmTransactionInitialTimeout: 60000 }
    );
    console.log("SimpleConnection initialisée avec", RPC_URL);
  }

  /**
   * Obtenir la connexion
   */
  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Attendre un délai
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exécuter une opération avec un timeout
   * @param operation La fonction à exécuter
   * @param timeoutMs Le délai maximum d'attente en ms (défaut: 30000ms)
   * @returns Le résultat de l'opération ou null en cas de timeout
   */
  public async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T | { timedOut: true }> {
    // Créer une promesse pour l'opération
    const operationPromise = operation();
    
    // Créer une promesse pour le timeout
    const timeoutPromise = new Promise<{ timedOut: true }>((resolve) => {
      setTimeout(() => {
        console.log(`Timeout atteint après ${timeoutMs}ms`);
        resolve({ timedOut: true });
      }, timeoutMs);
    });
    
    // Attendre la première des deux promesses
    return Promise.race([operationPromise, timeoutPromise]);
  }

  /**
   * Exécuter une opération avec retry
   */
  public async executeWithRetry<T>(
    operation: (connection: Connection) => Promise<T>
  ): Promise<T> {
    let error = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Exécuter l'opération
        const result = await operation(this.connection);
        this.retryCount = 0;
        return result;
      } catch (err: any) {
        error = err;
        console.error(`Erreur (tentative ${attempt + 1}/${this.maxRetries + 1}):`, err);
        
        // Si c'est une erreur liée à la signature, ne pas réessayer
        if (err.toString().includes('signature') || 
            err.toString().includes('signer') || 
            err.toString().includes('AccountNotSigner')) {
          console.error("Erreur de signature, abandon");
          throw err;
        }
        
        // Pour les erreurs de hauteur de bloc expirée, réessayer avec un nouveau blockhash
        if (err.toString().includes('BlockheightExceeded') || 
            err.toString().includes('block height exceeded')) {
          console.log("Erreur de hauteur de bloc expirée, obtention d'un nouveau blockhash");
          // Attendre plus longtemps pour cette erreur spécifique
          const waitTime = this.retryDelay * Math.pow(2, attempt + 1);
          console.log(`Nouvelle tentative avec nouveau blockhash dans ${waitTime}ms`);
          await this.delay(waitTime);
          this.retryCount++;
          continue;
        }
        
        // Pour les erreurs de taux limite ou de connexion, attendre et réessayer
        if (err.toString().includes('429') || 
            err.toString().includes('timeout') || 
            err.toString().includes('rate') ||
            err.toString().includes('fetch')) {
          
          const waitTime = this.retryDelay * Math.pow(2, attempt);
          console.log(`Nouvelle tentative dans ${waitTime}ms`);
          await this.delay(waitTime);
          this.retryCount++;
          continue;
        }
        
        // Pour les autres erreurs, simplement abandonner
        console.error("Erreur irrécupérable");
        throw err;
      }
    }
    
    console.error(`Échec après ${this.maxRetries + 1} tentatives, abandon.`);
    throw error;
  }
}

// Créer une instance partagée
export const simpleConnection = new SimpleConnection();

/**
 * Créer un programme Anchor avec un wallet personnalisé
 */
export function createSimpleProgram(
  publicKey: PublicKey, 
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>
): Program {
  try {
    console.log("Création de programme avec wallet:", publicKey.toBase58());
    
    // Vérifier les paramètres requis
    if (!publicKey) {
      throw new Error("PublicKey manquante");
    }
    
    if (!signTransaction) {
      throw new Error("SignTransaction manquant");
    }

    // CRUCIAL: Vérifier si les méthodes de signature sont bien des fonctions
    console.log("Vérification des méthodes de signature:", {
      signTransactionType: typeof signTransaction,
      signAllTransactionsType: typeof signAllTransactions
    });

    // Créer un wallet simple avec toutes les méthodes requises
    const wallet: Wallet = {
      publicKey,
      signTransaction,
      // CRUCIAL: S'assurer que signAllTransactions est correctement implémenté
      signAllTransactions: signAllTransactions || (async (txs: Transaction[]) => {
        // Implémenter de manière sécurisée la signature de plusieurs transactions
        return Promise.all(txs.map(tx => signTransaction(tx)));
      })
    };
    
    // Tester les méthodes du wallet
    console.log("Wallet créé:", {
      publicKey: wallet.publicKey.toBase58(),
      hasSignTransaction: !!wallet.signTransaction,
      hasSignAllTransactions: !!wallet.signAllTransactions
    });
    
    // Créer le provider avec des options explicites et optimisées
    const connection = simpleConnection.getConnection();
    const provider = new AnchorProvider(connection, wallet, {
      // Utiliser des paramètres optimaux pour Solana Devnet
      skipPreflight: false,
      commitment: 'confirmed',
      preflightCommitment: 'confirmed'
    });
    
    // Vérifier que le provider est correctement initialisé
    console.log("Provider créé:", {
      hasConnection: !!provider.connection,
      hasWallet: !!provider.wallet,
      walletPublicKey: provider.wallet.publicKey.toBase58(),
      commitment: 'confirmed',
      skipPreflight: false
    });
    
    // Vérifier que IDL contient createStudentGroup
    // Utiliser l'IDL original sans modification pour éviter les problèmes
    const programId = new PublicKey(config.solana.programId);
    
    // Vérification approfondie de l'IDL
    const createStudentGroupInstruction = IDL.instructions.find(
      instruction => instruction.name === 'createStudentGroup'
    );
    
    if (!createStudentGroupInstruction) {
      console.error("Instruction createStudentGroup non trouvée dans l'IDL!");
      console.log("Instructions disponibles:", IDL.instructions.map(i => i.name));
    } else {
      console.log("Instruction createStudentGroup trouvée:", {
        name: createStudentGroupInstruction.name,
        args: createStudentGroupInstruction.args,
        accounts: createStudentGroupInstruction.accounts.map(a => ({
          name: a.name,
          isMut: a.isMut,
          isSigner: a.isSigner
        }))
      });
    }
    
    // Ne pas modifier l'IDL, utiliser la version d'origine
    // Créer le programme avec l'IDL d'origine
    const program = new Program(IDL, programId, provider);
    
    // Vérifier que le programme a été créé correctement
    console.log("Programme créé avec méthodes:", Object.keys(program.methods || {}));
    
    // Vérifier si la méthode createStudentGroup est disponible
    if (!program.methods.createStudentGroup) {
      console.error("La méthode createStudentGroup n'est pas disponible!");
    } else {
      console.log("La méthode createStudentGroup est disponible");
    }
    
    return program;
  } catch (error) {
    console.error("Erreur lors de la création du programme:", error);
    throw error;
  }
} 