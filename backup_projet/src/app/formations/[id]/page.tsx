'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AdminGuard } from '../../../components/AdminGuard';
import CreateSessionForm from '../../../components/CreateSessionForm';
import EditSessionForm from '../../../components/EditSessionForm';
import { storageService } from '../../../services/storage.service';

interface Session {
  id: string;
  nom: string;
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
  sessions: Session[];
}

export default function FormationSessionsPage() {
  const { id } = useParams();
  const { publicKey } = useWallet();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [formation, setFormation] = useState<Formation | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showEditSession, setShowEditSession] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

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

  useEffect(() => {
    // Charger la formation et les sessions au montage du composant
    const loadedFormation = storageService.getFormation(id as string);
    const loadedSessions = storageService.getSessions(id as string);
    setFormation(loadedFormation);
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

    // Mettre à jour l'état local des sessions
    setSessions([...sessions, newSession]);

    // Mettre à jour la formation avec le nouveau nombre de sessions
    if (formation) {
      const updatedFormation = {
        ...formation,
        sessions: [...formation.sessions, newSession]
      };
      storageService.updateFormation(formation.id, updatedFormation);
      setFormation(updatedFormation);
    }

    setShowCreateSession(false);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setShowEditSession(true);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    // Mettre à jour la session
    storageService.updateSession(updatedSession.id, updatedSession);
    
    // Mettre à jour l'état local des sessions
    const updatedSessions = sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    );
    setSessions(updatedSessions);

    // Mettre à jour la formation avec les sessions mises à jour
    if (formation) {
      const updatedFormation = {
        ...formation,
        sessions: updatedSessions
      };
      storageService.updateFormation(formation.id, updatedFormation);
      setFormation(updatedFormation);
    }

    setShowEditSession(false);
    setSelectedSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      // Supprimer la session
      storageService.deleteSession(sessionId);
      
      // Mettre à jour l'état local des sessions
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);

      // Mettre à jour la formation avec le nouveau nombre de sessions
      if (formation) {
        const updatedFormation = {
          ...formation,
          sessions: updatedSessions
        };
        storageService.updateFormation(formation.id, updatedFormation);
        setFormation(updatedFormation);
      }
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Gestion des Sessions</h1>
        <WalletMultiButton />
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Sessions de la Formation</h1>
              <p className="text-gray-600 mt-2">
                {formation.nom} - Du {formatDateToDisplay(formation.dateDebut)} au {formatDateToDisplay(formation.dateFin)}
              </p>
            </div>
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
                  <p>Date: {formatDateToDisplay(session.date)}</p>
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
                    onClick={() => handleEditSession(session)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Supprimer
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
          formationDateDebut={formation.dateDebut}
          formationDateFin={formation.dateFin}
        />
      )}

      {showEditSession && selectedSession && (
        <EditSessionForm
          session={selectedSession}
          onSubmit={handleUpdateSession}
          onCancel={() => {
            setShowEditSession(false);
            setSelectedSession(null);
          }}
          formationDateDebut={formation.dateDebut}
          formationDateFin={formation.dateFin}
        />
      )}
    </AdminGuard>
  );
} 