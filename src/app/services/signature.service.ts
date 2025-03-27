import { PublicKey } from '@solana/web3.js';
import { Connection, Program } from '@project-serum/anchor';
import { registerPresence, validatePresence } from './solana.service';

export interface SignatureValidation {
  isValid: boolean;
  message: string;
  timestamp: string;
}

export interface SignatureData {
  signature: string;
  studentId: string;
  sessionId: string;
  timestamp: string;
  nom: string;
  prenom: string;
}

export const validateSignature = (
  signature: string,
  studentId: string,
  sessionId: string
): SignatureValidation => {
  // Vérification basique de la signature
  if (!signature || signature.length < 10) {
    return {
      isValid: false,
      message: 'Signature invalide ou trop courte',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    isValid: true,
    message: 'Signature valide',
    timestamp: new Date().toISOString(),
  };
};

export const saveSignature = async (
  signatureData: SignatureData,
  adminPublicKey: PublicKey,
  connection: Connection,
  program: Program
): Promise<boolean> => {
  try {
    // Enregistrer la présence sur Solana
    const presenceId = await registerPresence(
      connection,
      program,
      {
        etudiantId: signatureData.studentId,
        nom: signatureData.nom,
        prenom: signatureData.prenom,
        signature: signatureData.signature,
        timestamp: signatureData.timestamp,
        sessionId: new PublicKey(signatureData.sessionId),
      }
    );

    // Valider la présence
    const isValidated = await validatePresence(
      connection,
      program,
      presenceId,
      adminPublicKey
    );

    return isValidated;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la signature:', error);
    return false;
  }
}; 