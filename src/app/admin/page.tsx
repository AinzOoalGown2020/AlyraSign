'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '../components/AdminGuard';
import CreateFormationForm from '../components/CreateFormationForm';
import { storageService } from '../services/storage.service';

interface Formation {
  id: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  sessions: Session[];
}

interface Session {
  id: string;
  nom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Charger les formations au montage du composant
    const loadedFormations = storageService.getFormations();
    setFormations(loadedFormations);
  }, []);

  const handleCreateFormation = (formation: {
    nom: string;
    description: string;
    dateDebut: string;
    dateFin: string;
  }) => {
    const newFormation: Formation = {
      id: Date.now().toString(),
      ...formation,
      sessions: [],
    };
    
    // Sauvegarder la formation
    storageService.saveFormation(newFormation);
    
    // Mettre à jour l'état local
    setFormations([...formations, newFormation]);
    setShowCreateForm(false);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Administration des Formations</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Créer une Formation
            </button>
          </div>

          {/* Grille des formations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <div
                key={formation.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{formation.nom}</h2>
                <p className="text-gray-600 mb-4">{formation.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Du: {formation.dateDebut}</p>
                  <p>Au: {formation.dateFin}</p>
                  <p>Sessions: {formation.sessions.length}</p>
                </div>
                <button
                  onClick={() => router.push(`/admin/formations/${formation.id}`)}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Gérer les Sessions
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateForm && (
        <CreateFormationForm
          onSubmit={handleCreateFormation}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </AdminGuard>
  );
} 