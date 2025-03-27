'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface ActiveSession {
  id: string;
  nom: string;
  formation: string;
  date: string;
  heureDebut: string;
  heureFin: string;
}

export default function StudentPage() {
  const { publicKey } = useWallet();
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);

  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Portail Étudiant</h1>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sessions Actives</h1>

        {/* Liste des sessions actives */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{session.nom}</h2>
              <div className="text-sm text-gray-500 mb-4">
                <p>Formation: {session.formation}</p>
                <p>Date: {session.date}</p>
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