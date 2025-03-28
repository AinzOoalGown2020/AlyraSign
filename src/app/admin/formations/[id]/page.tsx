'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AdminGuard } from '../../../components/AdminGuard';
import CreateSessionForm from '../../../components/CreateSessionForm';
import { storageService } from '../../../services/storage.service';

interface Session {
  id: string;
  nom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
}

export default function FormationSessionsPage() {
  const { id } = useParams();
  const { publicKey } = useWallet();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);

  useEffect(() => {
    // Charger les sessions au montage du composant
    const loadedSessions = storageService.getSessions(id as string);
    setSessions(loadedSessions);
  }, [id]);

  const handleCreateSession = (session: {
    nom: string;
    date: string;
    heureDebut: string;
    heureFin: string;
  }) => {
    const newSession: Session = {
      id: Date.now().toString(),
      ...session,
    };

    // Sauvegarder la session
    storageService.saveSession({
      ...newSession,
      formationId: id as string,
    });

    // Mettre à jour l'état local
    setSessions([...sessions, newSession]);
    setShowCreateSession(false);
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Gestion des Sessions</h1>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Sessions de la Formation</h1>
            <button
              onClick={() => setShowCreateSession(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Créer une Session
            </button>
          </div>

          {/* Calendrier des sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{session.nom}</h2>
                <div className="text-sm text-gray-500">
                  <p>Date: {session.date}</p>
                  <p>Heure de début: {session.heureDebut}</p>
                  <p>Heure de fin: {session.heureFin}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {/* Logique pour gérer les présences */}}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Gérer les Présences
                  </button>
                  <button
                    onClick={() => {/* Logique pour modifier la session */}}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateSession && (
        <CreateSessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setShowCreateSession(false)}
        />
      )}
    </AdminGuard>
  );
} 