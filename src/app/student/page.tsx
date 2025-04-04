'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getProvider } from '@/app/services/blockchain.service';
import { getAllStudentGroups } from '@/app/services/student.service';
import { storageService } from '@/app/services/storage.service';

interface ActiveSession {
  id: string;
  nom: string;
  formation: string;
  date: string;
  heureDebut: string;
  heureFin: string;
}

interface Formation {
  id: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
}

export default function StudentPage() {
  const { publicKey, signTransaction, sendTransaction, connected } = useWallet();
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [studentFormations, setStudentFormations] = useState<Formation[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);

  // Fonction pour convertir une date au format DD/MM/YYYY
  const formatDateToDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Récupérer les formations de l'étudiant
  useEffect(() => {
    const fetchStudentFormations = async () => {
      if (!publicKey || !connected || !signTransaction || !sendTransaction) {
        console.log('Wallet non connecté:', {
          hasPublicKey: !!publicKey,
          connected,
          hasSignTransaction: !!signTransaction,
          hasSendTransaction: !!sendTransaction
        });
        return;
      }

      try {
        const program = getProvider(publicKey, signTransaction, sendTransaction);
        if (!program) {
          console.error('Program non initialisé');
          return;
        }

        console.log('Program initialisé avec succès');
        console.log('Program ID:', program.programId.toBase58());

        const groups = await getAllStudentGroups(program);
        console.log('Groupes récupérés de la blockchain:', groups);
        
        const studentAddress = publicKey.toBase58();
        console.log('Adresse de l\'étudiant:', studentAddress);
        
        // Trouver les groupes dont l'étudiant fait partie
        const studentGroups = groups.filter(group => 
          group.students.includes(studentAddress)
        );
        console.log('Groupes de l\'étudiant:', studentGroups);

        // Récupérer toutes les formations
        const allFormations = storageService.getFormations();
        console.log('Toutes les formations du localStorage:', allFormations);
        
        // Filtrer les formations auxquelles l'étudiant a accès
        const formations = allFormations.filter((formation: Formation) => 
          studentGroups.some(group => {
            const hasFormation = group.formations.includes(formation.id);
            console.log(`Vérification formation ${formation.id} pour le groupe ${group.name}:`, hasFormation);
            return hasFormation;
          })
        );
        console.log('Formations filtrées pour l\'étudiant:', formations);

        setStudentFormations(formations);
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
        if (error instanceof Error) {
          console.error('Message d\'erreur:', error.message);
          console.error('Stack trace:', error.stack);
        }
      }
    };

    fetchStudentFormations();
  }, [publicKey, connected, signTransaction, sendTransaction]);

  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Espace Étudiant</h1>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Espace Étudiant</h1>

        {/* Liste des formations */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Mes Formations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentFormations.map((formation) => (
              <div
                key={formation.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{formation.nom}</h3>
                <p className="text-gray-600 mb-4">{formation.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Du: {formatDateToDisplay(formation.dateDebut)}</p>
                  <p>Au: {formatDateToDisplay(formation.dateFin)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liste des sessions actives */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sessions Actives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{session.nom}</h3>
                <div className="text-sm text-gray-500 mb-4">
                  <p>Formation: {session.formation}</p>
                  <p>Date: {formatDateToDisplay(session.date)}</p>
                  <p>Heure: {session.heureDebut} - {session.heureFin}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSession(session);
                    setShowSignatureModal(true);
                  }}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Signer ma Présence
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de signature */}
      {showSignatureModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Signer ma Présence</h2>
            <div className="mb-6">
              <p className="text-gray-600">Session: {selectedSession.nom}</p>
              <p className="text-gray-600">Formation: {selectedSession.formation}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4 mb-6">
              {/* Zone de signature à implémenter */}
              <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Zone de signature</p>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Logique pour valider la signature
                  setShowSignatureModal(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 