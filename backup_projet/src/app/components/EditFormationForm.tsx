'use client';

import React, { useState } from 'react';

interface Formation {
  id: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  sessions: any[];
}

interface EditFormationFormProps {
  formation: Formation;
  onSubmit: (formation: Formation) => void;
  onCancel: () => void;
}

export default function EditFormationForm({ 
  formation,
  onSubmit, 
  onCancel,
}: EditFormationFormProps) {
  const [formData, setFormData] = useState<Formation>({
    ...formation,
  });

  const [error, setError] = useState<string>('');

  // Fonction pour convertir une date YYYY-MM-DD en format DD/MM/YYYY
  const formatDateFromInput = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation des dates
    const debutFormation = new Date(formData.dateDebut);
    const finFormation = new Date(formData.dateFin);

    if (debutFormation > finFormation) {
      setError('La date de début doit être antérieure à la date de fin');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Modifier la Formation</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de la formation</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de début</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.dateDebut}
              onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.dateDebut && `Date sélectionnée : ${formatDateFromInput(formData.dateDebut)}`}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
            <input
              type="date"
              required
              min={formData.dateDebut}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.dateFin}
              onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.dateFin && `Date sélectionnée : ${formatDateFromInput(formData.dateFin)}`}
            </div>
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 