'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '../components/AdminGuard';
import CreateFormationForm from '../components/CreateFormationForm';
import EditFormationForm from '../components/EditFormationForm';
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
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

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

  const handleEditFormation = (formation: Formation) => {
    setSelectedFormation(formation);
    setShowEditForm(true);
  };

  const handleUpdateFormation = (updatedFormation: Formation) => {
    // Mettre à jour la formation
    storageService.updateFormation(updatedFormation.id, updatedFormation);
    
    // Mettre à jour l'état local
    setFormations(formations.map(f => 
      f.id === updatedFormation.id ? updatedFormation : f
    ));
    setShowEditForm(false);
    setSelectedFormation(null);
  };

  const handleDeleteFormation = (formationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      // Supprimer la formation
      storageService.deleteFormation(formationId);
      
      // Mettre à jour l'état local
      setFormations(formations.filter(f => f.id !== formationId));
    }
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
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/formations/${formation.id}`)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Gérer les Sessions
                  </button>
                  <button
                    onClick={() => handleEditFormation(formation)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteFormation(formation.id)}
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

      {showCreateForm && (
        <CreateFormationForm
          onSubmit={handleCreateFormation}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {showEditForm && selectedFormation && (
        <EditFormationForm
          formation={selectedFormation}
          onSubmit={handleUpdateFormation}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedFormation(null);
          }}
        />
      )}
    </AdminGuard>
  );
} 