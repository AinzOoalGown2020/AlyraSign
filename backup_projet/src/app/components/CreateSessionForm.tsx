'use client';

import React, { useState } from 'react';

interface CreateSessionFormProps {
  onSubmit: (session: {
    nom: string;
    date: string;
    heureDebut: string;
    heureFin: string;
  }) => void;
  onCancel: () => void;
  formationDateDebut: string;
  formationDateFin: string;
}

export default function CreateSessionForm({ 
  onSubmit, 
  onCancel,
  formationDateDebut,
  formationDateFin 
}: CreateSessionFormProps) {
  const [formData, setFormData] = useState({
    nom: '',
    date: '',
    heureDebut: '',
    heureFin: '',
  });

  const [error, setError] = useState<string>('');

  // Fonction pour convertir une date ISO en format DD/MM/YYYY
  const formatDateToDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour convertir une date DD/MM/YYYY en format YYYY-MM-DD
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  // Fonction pour convertir une date YYYY-MM-DD en format DD/MM/YYYY
  const formatDateFromInput = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation de la date
    const selectedDate = new Date(formData.date);
    const debutFormation = new Date(formationDateDebut);
    const finFormation = new Date(formationDateFin);

    if (selectedDate < debutFormation || selectedDate > finFormation) {
      setError(`La date doit être comprise entre ${formatDateToDisplay(formationDateDebut)} et ${formatDateToDisplay(formationDateFin)}`);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Créer une Nouvelle Session</h2>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Période de la formation :</span><br />
            Du {formatDateToDisplay(formationDateDebut)} au {formatDateToDisplay(formationDateFin)}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de la session</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              required
              min={formationDateDebut.split('T')[0]}
              max={formationDateFin.split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.date && `Date sélectionnée : ${formatDateFromInput(formData.date)}`}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Heure de début</label>
            <input
              type="time"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.heureDebut}
              onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Heure de fin</label>
            <input
              type="time"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.heureFin}
              onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 