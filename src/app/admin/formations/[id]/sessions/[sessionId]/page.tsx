'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AdminGuard } from '@/app/components/AdminGuard';
import AddStudentForm from '@/app/components/AddStudentForm';
import SignatureValidation from '@/app/components/SignatureValidation';

interface Presence {
  id: string;
  etudiantId: string;
  nom: string;
  prenom: string;
  signature: string;
  timestamp: string;
  isValidated: boolean;
}

export default function SessionPresencePage() {
  const { id, sessionId } = useParams();
  const { publicKey } = useWallet();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState<Presence | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Gestion des Présences</h1>
        <WalletMultiButton />
      </div>
    );
  }

  const handleAddStudent = (student: {
    nom: string;
    prenom: string;
    etudiantId: string;
  }) => {
    const newPresence: Presence = {
      id: Date.now().toString(),
      ...student,
      signature: '',
      timestamp: new Date().toISOString(),
      isValidated: false,
    };
    setPresences([...presences, newPresence]);
    setShowAddStudent(false);
  };

  const handleValidateSignature = (presence: Presence) => {
    setSelectedPresence(presence);
    setShowValidation(true);
  };

  const handleValidationComplete = (success: boolean) => {
    if (selectedPresence) {
      setPresences(
        presences.map((p) =>
          p.id === selectedPresence.id
            ? { ...p, isValidated: success }
            : p
        )
      );
    }
    setShowValidation(false);
    setSelectedPresence(null);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Liste des Présences</h1>
            <button
              onClick={() => setShowAddStudent(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Ajouter un Étudiant
            </button>
          </div>

          {/* Tableau des présences */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horodatage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {presences.map((presence) => (
                  <tr key={presence.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {presence.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presence.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presence.etudiantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presence.signature ? (
                        <img
                          src={presence.signature}
                          alt="Signature"
                          className="h-8 w-16 object-contain"
                        />
                      ) : (
                        'Non signé'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presence.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          presence.isValidated
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {presence.isValidated ? 'Validé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presence.signature && !presence.isValidated && (
                        <button
                          onClick={() => handleValidateSignature(presence)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Valider
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddStudent && (
        <AddStudentForm
          onSubmit={handleAddStudent}
          onCancel={() => setShowAddStudent(false)}
        />
      )}

      {showValidation && selectedPresence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Validation de la Signature</h2>
            <SignatureValidation
              signature={selectedPresence.signature}
              studentId={selectedPresence.etudiantId}
              sessionId={sessionId as string}
              onValidationComplete={handleValidationComplete}
            />
          </div>
        </div>
      )}
    </AdminGuard>
  );
} 