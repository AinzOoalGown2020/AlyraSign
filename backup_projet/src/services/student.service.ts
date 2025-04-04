import { Program, BN, AnchorProvider } from '@coral-xyz/anchor'
import { 
  PublicKey, 
  SystemProgram, 
  Connection, 
  TransactionInstruction, 
  AccountMeta, 
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  Keypair 
} from '@solana/web3.js'
import { config } from '@/config/param.config'
import { useWallet } from '@solana/wallet-adapter-react'

// Import de la classe SimpleConnection depuis simple-connection
import { simpleConnection } from './simple-connection'

export interface StudentGroup {
  publicKey: PublicKey
  account: {
    authority: PublicKey
    name: string
    students: string[]
    formations: string[]
  }
}

// Fonction utilitaire pour obtenir le PDA du groupe
const getGroupPda = (program: Program, groupName: string): PublicKey => {
  const [pda, _bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('student_group'), Buffer.from(groupName)],
    program.programId
  );
  
  console.log('Generated PDA:', {
    programId: program.programId.toBase58(),
    groupName,
    pda: pda.toBase58(),
    seeds: ['student_group', groupName]
  });
  
  return pda;
};

// Fonction pour sérialiser un tableau de strings pour l'instruction Solana
function serializeStringArray(arr: string[]): Buffer {
  // D'abord calculer la taille totale
  let size = 4; // 4 bytes pour la longueur du tableau
  arr.forEach(str => {
    size += 4; // 4 bytes pour la longueur de chaque string
    size += Buffer.from(str).length;
  });
  
  // Créer le buffer
  const buffer = Buffer.alloc(size);
  let offset = 0;
  
  // Écrire la longueur du tableau
  buffer.writeUInt32LE(arr.length, offset);
  offset += 4;
  
  // Écrire chaque élément
  arr.forEach(str => {
    const strBuffer = Buffer.from(str);
    buffer.writeUInt32LE(strBuffer.length, offset);
    offset += 4;
    strBuffer.copy(buffer, offset);
    offset += strBuffer.length;
  });
  
  return buffer;
}

// Créer le discriminator pour la fonction createStudentGroup
// Anchor utilise ce format spécifique pour ses discriminators
const createDiscriminator = async (name: string): Promise<Buffer> => {
  // Pour Anchor, le discriminator est les 8 premiers bytes du hash SHA256 du nom complet de l'instruction
  // Le format correct est "namespace::instruction_name" ou simplement "instruction_name"
  const methodName = `instruction_${name}`;
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(methodName));
  
  // Extraire les 8 premiers bytes
  return Buffer.from(new Uint8Array(hash).slice(0, 8));
};

export const createStudentGroup = async (
  program: Program,
  admin: PublicKey,
  groupName: string,
  students: string[],
  formations: string[]
): Promise<string | undefined> => {
  try {
    // Tronquer le nom du groupe à 50 caractères max (selon la définition dans le programme Solana)
    const truncatedName = groupName.substring(0, 50);
    
    // Limiter le nombre d'étudiants à 100 max avec 50 caractères max par étudiant
    const limitedStudents = students
      .slice(0, 100)
      .map(s => s.substring(0, 50));
    
    // Limiter le nombre de formations à 20 max avec 50 caractères max par formation
    const limitedFormations = formations
      .slice(0, 20)
      .map(f => f.substring(0, 50));
    
    console.log('CORRECTION ERREUR 3010:', {
      admin: admin.toBase58(),
      groupName: truncatedName,
      studentsCount: limitedStudents.length,
      formationsCount: limitedFormations.length,
      programId: program.programId.toBase58()
    });

    // Vérifier que le wallet et le provider sont correctement initialisés
    if (!program.provider || !program.provider.wallet || !program.provider.wallet.publicKey) {
      console.error("Le provider ou le wallet n'est pas correctement initialisé");
      throw new Error("Provider ou wallet non initialisé");
    }

    // CRUCIAL: Vérifier que l'admin fourni correspond au wallet qui va signer la transaction
    const walletPublicKey = program.provider.wallet.publicKey;
    
    console.log("VÉRIFICATION SIGNATAIRE:", {
      admin: admin.toBase58(),
      wallet_publicKey: walletPublicKey.toBase58(),
      are_equal: admin.equals(walletPublicKey),
      wallet_type: program.provider.wallet.constructor.name,
      provider_type: program.provider.constructor.name,
      has_signTransaction: !!program.provider.wallet.signTransaction,
      has_signAllTransactions: !!program.provider.wallet.signAllTransactions,
      has_sendTransaction: !!(program.provider as any).wallet.sendTransaction
    });

    // CRUCIAL: Pour résoudre l'erreur AccountNotSigner, nous DEVONS utiliser le wallet connecté
    // comme compte d'autorité, sinon Anchor échouera à la vérification de signature
    if (!admin.equals(walletPublicKey)) {
      console.error("⚠️ CRITIQUE: L'administrateur spécifié ne correspond pas au wallet connecté!");
      console.error("Impossible de continuer car cela causerait l'erreur AccountNotSigner (3010)");
      throw new Error("Le wallet connecté ne correspond pas à l'administrateur spécifié");
    }

    // Obtenir le PDA du groupe
    const [groupPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('student_group'), Buffer.from(truncatedName)],
      program.programId
    );
    
    console.log("PDA du groupe:", groupPda.toBase58(), "avec bump:", bump);

    // Vérifier la disponibilité de sendTransaction dans le wallet adapter
    const sendTransactionAvailable = !!(program.provider as any).wallet.sendTransaction;
    if (!sendTransactionAvailable) {
      console.warn("La méthode sendTransaction n'est pas disponible sur le wallet adapter!");
    }

    // Créer la transaction en utilisant les méthodes Anchor
    console.log("Création de la transaction via Anchor...");
    const transaction = await program.methods
      .createStudentGroup(
        truncatedName,
        limitedStudents,
        limitedFormations
      )
      .accounts({
        authority: admin, // Utiliser admin (qui est égal à walletPublicKey, vérifié plus haut)
        group: groupPda,
        systemProgram: SystemProgram.programId
      })
      .transaction();

    // S'assurer que le feePayer est correctement défini
    transaction.feePayer = walletPublicKey;
    
    // Obtenir un recentBlockhash pour la transaction
    const connection = program.provider.connection;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    console.log("Transaction préparée avec les paramètres:", {
      feePayer: transaction.feePayer?.toBase58(),
      recentBlockhash: transaction.recentBlockhash,
      instructionCount: transaction.instructions.length,
      signers: transaction.signatures.map(s => s.publicKey.toBase58())
    });

    // Tentative directe avec sendTransaction si disponible sur le wallet adaptor
    if (sendTransactionAvailable && (program.provider as any).wallet.sendTransaction) {
      console.log("Utilisation de wallet.sendTransaction directement...");
      try {
        // Utiliser le wallet adapter sendTransaction, qui va gérer la signature
        const signature = await (program.provider as any).wallet.sendTransaction(transaction, connection);
        console.log("Transaction envoyée avec succès via sendTransaction, signature:", signature);
        
        // Attendre la confirmation
        console.log("Attente de confirmation de la transaction...");
        const confirmResult = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed');
        
        console.log("Transaction confirmée:", confirmResult);
        return signature;
      } catch (sendTxError) {
        console.error("Erreur lors de l'envoi direct via sendTransaction:", sendTxError);
        // Si l'erreur est liée à l'annulation par l'utilisateur, propager l'erreur
        if (String(sendTxError).includes("reject") || String(sendTxError).includes("user cancelled")) {
          throw sendTxError;
        }
        // Si l'envoi direct échoue, essayer la méthode standard Anchor
        console.warn("Échec de sendTransaction, tentative avec la méthode Anchor standard...");
      }
    }

    // Méthode alternative: utiliser Anchor RPC (qui devrait gérer la signature via le provider)
    console.log("Utilisation de la méthode Anchor RPC...");
    try {
      const signature = await program.methods
        .createStudentGroup(
          truncatedName,
          limitedStudents,
          limitedFormations
        )
        .accounts({
          authority: admin,
          group: groupPda,
          systemProgram: SystemProgram.programId
        })
        .rpc({
          commitment: 'confirmed',
          skipPreflight: false
        });
      
      console.log("Transaction envoyée avec succès via Anchor RPC, signature:", signature);
      return signature;
    } catch (rpcError) {
      console.error("Erreur RPC lors de l'envoi de la transaction:", rpcError);
      
      // Si l'erreur est toujours AccountNotSigner, essayer une autre approche
      if (String(rpcError).includes("AccountNotSigner") || String(rpcError).includes("3010")) {
        console.warn("Erreur 3010 persistante, tentative avec une approche manuelle...");
        
        // Utiliser signTransaction et sendRawTransaction manuellement
        try {
          // Signer explicitement
          const signedTx = await program.provider.wallet.signTransaction(transaction);
          console.log("Transaction signée manuellement");
          
          // Envoyer la transaction signée
          const rawTx = signedTx.serialize();
          const signature = await connection.sendRawTransaction(rawTx, {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
          });
          
          console.log("Transaction raw envoyée manuellement, signature:", signature);
          await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed');
          
          console.log("Approche manuelle réussie!");
          return signature;
        } catch (manualError) {
          console.error("Échec de l'approche manuelle:", manualError);
          throw manualError;
        }
      }
      
      // Si ce n'est pas une erreur de signature, propager l'erreur
      throw rpcError;
    }
  } catch (error) {
    console.error("Erreur lors de la création du groupe étudiant:", error);
    if (error instanceof Error) {
      console.error("- Message d'erreur:", error.message);
      console.error("- Stack trace:", error.stack);
    }
    // Propager l'erreur au lieu de retourner undefined pour une meilleure gestion des erreurs
    throw error;
  }
};

export const addStudentsToGroup = async (
  program: Program,
  admin: PublicKey,
  groupName: string,
  students: string[]
): Promise<string> => {
  if (!program.provider.wallet || !program.provider.wallet.publicKey) {
    throw new Error('Wallet non initialisé')
  }

  const groupPda = getGroupPda(program, groupName)

  try {
    const tx = await program.methods
      .addStudentsToGroup(groupName, students)
      .accounts({
        admin,
        group: groupPda,
      })
      .rpc()

    return tx
  } catch (error) {
    console.error('Error adding students to group:', error)
    throw error
  }
}

export const removeStudentsFromGroup = async (
  program: Program,
  admin: PublicKey,
  groupName: string,
  students: string[]
): Promise<string> => {
  if (!program.provider.wallet || !program.provider.wallet.publicKey) {
    throw new Error('Wallet non initialisé')
  }

  const groupPda = getGroupPda(program, groupName)

  try {
    const tx = await program.methods
      .removeStudentsFromGroup(groupName, students)
      .accounts({
        admin,
        group: groupPda,
      })
      .rpc()

    return tx
  } catch (error) {
    console.error('Error removing students from group:', error)
    throw error
  }
}

export const setStudentFormation = async (
  program: Program,
  admin: PublicKey,
  groupName: string,
  formations: string[]
): Promise<string | undefined> => {
  if (!program.provider.wallet || !program.provider.wallet.publicKey) {
    throw new Error('Wallet non initialisé');
  }

  const groupPda = getGroupPda(program, groupName);

  try {
    // Obtenir les données du groupe actuel pour vérification
    const group = await program.account.studentGroup.fetch(groupPda);
    console.log("Groupe existant:", {
      name: group.name,
      formations: group.formations || []
    });
    
    // Limiter les formations à 20 maximum avec 50 caractères max par formation
    const limitedFormations = formations
      .slice(0, 20)
      .map(f => f.substring(0, 50));
    
    // Appeler la méthode setFormationsForGroup du programme Anchor
    const tx = await program.methods
      .setFormationsForGroup(groupName, limitedFormations)
      .accounts({
        admin,
        group: groupPda,
      })
      .rpc({
        skipPreflight: true,
        commitment: 'processed',
        preflightCommitment: 'processed'
      });
    
    console.log("Formations mises à jour avec succès:", tx);
    return tx;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des formations du groupe:', error);
    if (error instanceof Error) {
      console.error("- Message d'erreur:", error.message);
      console.error("- Stack trace:", error.stack);
    }
    return undefined;
  }
}

export const getStudentGroup = async (
  program: Program,
  groupName: string
): Promise<StudentGroup | null> => {
  try {
    const groupPda = getGroupPda(program, groupName);
    const group = await program.account.studentGroup.fetch(groupPda);
    return group as unknown as StudentGroup;
  } catch (error) {
    console.error('Error fetching student group:', error);
    return null;
  }
}

export const getAllStudentGroups = async (
  program: Program
): Promise<StudentGroup[]> => {
  try {
    console.log('Début de la récupération des groupes...');
    console.log('Program ID:', program.programId.toBase58());
    console.log('Provider wallet:', program.provider.wallet.publicKey.toBase58());
    
    // Utiliser notre connexion simplifiée  
    // MÉTHODE DIRECTE SOLANA: Utiliser les API RPC natives
    const directSolanaSearch = async () => {
      console.log("Recherche directe via l'API Solana getProgramAccounts");
      try {
        // Utiliser la connexion simple pour cette opération
        const accounts = await simpleConnection.executeWithRetry(
          (connection) => connection.getProgramAccounts(program.programId)
        );
        
        console.log(`Comptes trouvés via getProgramAccounts (${accounts.length}):`, 
          accounts.map(a => ({
            pubkey: a.pubkey.toBase58(),
            dataLength: a.account.data.length
          }))
        );
        
        if (accounts.length === 0) {
          console.log("Aucun compte trouvé pour ce programme");
          
          // Essayer les groupes locaux
          try {
            const localGroups = typeof window !== 'undefined' ? 
              JSON.parse(localStorage.getItem('localStudentGroups') || '[]') : [];
            
            if (localGroups.length > 0) {
              console.log("Retour des groupes locaux en l'absence de données blockchain:", localGroups);
              return localGroups.map((group: any) => ({
                publicKey: new PublicKey(group.publicKey || group.authority),
                account: {
                  authority: new PublicKey(group.authority),
                  name: group.name,
                  students: group.students || [],
                  formations: group.formations || []
                }
              }));
            }
          } catch (e) {
            console.error("Erreur lors de la récupération des groupes locaux:", e);
          }
          
          return [];
        }
        
        // Essayer de décoder les comptes trouvés
        console.log("Tentative de décodage des comptes");
        const studentGroups: StudentGroup[] = [];
        
        for (const account of accounts) {
          try {
            // Vérifier la taille minimale
            if (account.account.data.length < 10) {
              console.log(`Compte ${account.pubkey.toBase58()} ignoré car trop petit (${account.account.data.length} bytes)`);
              continue;
            }
            
            // Essayer de décoder avec le coder Anchor
            try {
              let decoded;
              if (program.account.studentGroup) {
                decoded = program.account.studentGroup.coder.accounts.decode('studentGroup', account.account.data);
              } else if (program.account.studentgroup) {
                decoded = program.account.studentgroup.coder.accounts.decode('studentgroup', account.account.data);
              }
              
              if (!decoded) {
                console.log(`Décodage impossible pour ${account.pubkey.toBase58()}`);
                continue;
              }
              
              console.log(`Compte décodé ${account.pubkey.toBase58()}:`, decoded);
              
              // Ajouter à la liste des groupes
              studentGroups.push({
                publicKey: account.pubkey,
                account: {
                  authority: decoded.authority,
                  name: decoded.name,
                  students: decoded.students || [],
                  formations: decoded.formations || []
                }
              });
            } catch (decodeError) {
              console.log(`Erreur lors du décodage du compte ${account.pubkey.toBase58()}:`, decodeError);
              
              // Analyser manuellement les données
              try {
                const rawData = account.account.data;
                // Utiliser Borsh ou une autre méthode pour décoder manuellement si nécessaire
                
                // Comparer avec les groupes locaux
                const localGroups = typeof window !== 'undefined' ? 
                  JSON.parse(localStorage.getItem('localStudentGroups') || '[]') : [];
                
                for (const localGroup of localGroups) {
                  // Vérifier si c'est notre groupe en recherchant le nom dans les données
                  const nameBytes = Buffer.from(localGroup.name);
                  const dataString = Buffer.from(rawData).toString('utf8');
                  
                  if (dataString.includes(localGroup.name)) {
                    console.log(`Groupe potentiel trouvé pour '${localGroup.name}' dans ${account.pubkey.toBase58()}`);
                    studentGroups.push({
                      publicKey: account.pubkey,
                      account: {
                        authority: new PublicKey(localGroup.authority),
                        name: localGroup.name,
                        students: localGroup.students || [],
                        formations: localGroup.formations || []
                      }
                    });
                    break;
                  }
                }
              } catch (manualError) {
                console.log(`Erreur lors de l'analyse manuelle: ${manualError}`);
              }
            }
          } catch (accountError) {
            console.log(`Erreur lors du traitement du compte ${account.pubkey.toBase58()}:`, accountError);
          }
        }
        
        console.log(`Groupes trouvés via recherche directe Solana: ${studentGroups.length}`);
        
        // Si aucun groupe n'est trouvé, retourner les groupes locaux
        if (studentGroups.length === 0) {
          const localGroups = typeof window !== 'undefined' ? 
            JSON.parse(localStorage.getItem('localStudentGroups') || '[]') : [];
          
          if (localGroups.length > 0) {
            console.log("Retour des groupes locaux en l'absence de données blockchain:", localGroups);
            return localGroups.map((group: any) => ({
              publicKey: new PublicKey(group.publicKey || group.authority),
              account: {
                authority: new PublicKey(group.authority),
                name: group.name,
                students: group.students || [],
                formations: group.formations || []
              }
            }));
          }
        }
        
        return studentGroups;
      } catch (error) {
        console.error("Erreur lors de la recherche directe Solana:", error);
        
        // En cas d'erreur, retourner les groupes locaux
        const localGroups = typeof window !== 'undefined' ? 
          JSON.parse(localStorage.getItem('localStudentGroups') || '[]') : [];
        
        if (localGroups.length > 0) {
          console.log("Fallback vers les groupes locaux après erreur:", localGroups);
          return localGroups.map((group: any) => ({
            publicKey: new PublicKey(group.publicKey || group.authority),
            account: {
              authority: new PublicKey(group.authority),
              name: group.name,
              students: group.students || [],
              formations: group.formations || []
            }
          }));
        }
        
        return [];
      }
    };
    
    // Tenter la recherche standard via Anchor
    try {
      console.log("Tentative avec la méthode Anchor standard");
      
      let groups: any[] = [];
      
      // Utiliser la connexion simple
      try {
        if (program.account.studentGroup) {
          console.log("Appel de studentGroup.all()");
          groups = await simpleConnection.executeWithRetry(
            async () => await program.account.studentGroup.all()
          );
        } else if (program.account.studentgroup) {
          console.log("Appel de studentgroup.all()");
          groups = await simpleConnection.executeWithRetry(
            async () => await program.account.studentgroup.all()
          );
        }
      } catch (e) {
        console.error("Erreur avec les appels Anchor:", e);
      }
      
      console.log(`Groupes bruts récupérés via Anchor (${groups.length}):`, 
        groups.map(item => ({
          publicKey: item.publicKey.toBase58(),
          name: item.account.name
        }))
      );
      
      if (groups.length > 0) {
        return groups.map(item => ({
          publicKey: item.publicKey,
          account: item.account
        }));
      }
      
      // Si les méthodes Anchor échouent, utiliser la recherche Solana directe
      console.log("Aucun groupe trouvé via Anchor, tentative avec Solana directe");
      return await directSolanaSearch();
    } catch (error) {
      console.error("Erreur lors de la recherche via Anchor:", error);
      // En cas d'erreur, utiliser la méthode directe
      return await directSolanaSearch();
    }
  } catch (error) {
    console.error('Erreur globale lors de la récupération des groupes:', error);
    
    // Fallback vers les groupes locaux
    try {
      const localGroups = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('localStudentGroups') || '[]') : [];
      
      if (localGroups.length > 0) {
        console.log("Fallback vers les groupes locaux après erreur globale:", localGroups);
        return localGroups.map((group: any) => ({
          publicKey: new PublicKey(group.publicKey || group.authority),
          account: {
            authority: new PublicKey(group.authority),
            name: group.name,
            students: group.students || [],
            formations: group.formations || []
          }
        }));
      }
    } catch (e) {
      console.error("Erreur lors du fallback vers les groupes locaux:", e);
    }
    
    return [];
  }
}; 