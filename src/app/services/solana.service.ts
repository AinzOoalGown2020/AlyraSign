import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

// Structure de données pour une formation
export interface FormationData {
  id: PublicKey;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  admin: PublicKey;
  sessions: PublicKey[];
}

// Structure de données pour une session
export interface SessionData {
  id: PublicKey;
  formationId: PublicKey;
  nom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  presences: PublicKey[];
}

// Structure de données pour une présence
export interface PresenceData {
  id: PublicKey;
  sessionId: PublicKey;
  etudiantId: string;
  nom: string;
  prenom: string;
  signature: string;
  timestamp: string;
  isValidated: boolean;
}

// Fonction pour créer une nouvelle formation
export const createFormation = async (
  connection: Connection,
  program: Program,
  formation: Omit<FormationData, 'id' | 'sessions'>
): Promise<PublicKey> => {
  const formationKeypair = Keypair.generate();
  const formationId = formationKeypair.publicKey;

  await program.methods
    .createFormation(
      formation.nom,
      formation.description,
      formation.dateDebut,
      formation.dateFin
    )
    .accounts({
      formation: formationId,
      admin: formation.admin,
      systemProgram: SystemProgram.programId,
    })
    .signers([formationKeypair])
    .rpc();

  return formationId;
};

// Fonction pour créer une nouvelle session
export const createSession = async (
  connection: Connection,
  program: Program,
  session: Omit<SessionData, 'id' | 'presences'>
): Promise<PublicKey> => {
  const sessionKeypair = Keypair.generate();
  const sessionId = sessionKeypair.publicKey;

  await program.methods
    .createSession(
      session.nom,
      session.date,
      session.heureDebut,
      session.heureFin
    )
    .accounts({
      session: sessionId,
      formation: session.formationId,
      systemProgram: SystemProgram.programId,
    })
    .signers([sessionKeypair])
    .rpc();

  return sessionId;
};

// Fonction pour enregistrer une présence
export const registerPresence = async (
  connection: Connection,
  program: Program,
  presence: Omit<PresenceData, 'id'>
): Promise<PublicKey> => {
  const presenceKeypair = Keypair.generate();
  const presenceId = presenceKeypair.publicKey;

  await program.methods
    .registerPresence(
      presence.etudiantId,
      presence.nom,
      presence.prenom,
      presence.signature,
      presence.timestamp
    )
    .accounts({
      presence: presenceId,
      session: presence.sessionId,
      systemProgram: SystemProgram.programId,
    })
    .signers([presenceKeypair])
    .rpc();

  return presenceId;
};

// Fonction pour valider une présence
export const validatePresence = async (
  connection: Connection,
  program: Program,
  presenceId: PublicKey,
  adminPublicKey: PublicKey
): Promise<boolean> => {
  try {
    await program.methods
      .validatePresence()
      .accounts({
        presence: presenceId,
        admin: adminPublicKey,
      })
      .rpc();

    return true;
  } catch (error) {
    console.error('Erreur lors de la validation de la présence:', error);
    return false;
  }
};

// Fonction pour récupérer une formation
export const getFormation = async (
  connection: Connection,
  program: Program,
  formationId: PublicKey
): Promise<FormationData | null> => {
  try {
    const formation = await program.account.formation.fetch(formationId);
    return formation as FormationData;
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    return null;
  }
};

// Fonction pour récupérer une session
export const getSession = async (
  connection: Connection,
  program: Program,
  sessionId: PublicKey
): Promise<SessionData | null> => {
  try {
    const session = await program.account.session.fetch(sessionId);
    return session as SessionData;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
};

// Fonction pour récupérer une présence
export const getPresence = async (
  connection: Connection,
  program: Program,
  presenceId: PublicKey
): Promise<PresenceData | null> => {
  try {
    const presence = await program.account.presence.fetch(presenceId);
    return presence as PresenceData;
  } catch (error) {
    console.error('Erreur lors de la récupération de la présence:', error);
    return null;
  }
}; 