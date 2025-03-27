'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { validateSignature, saveSignature, SignatureData } from '../services/signature.service';

interface SignatureValidationProps {
  signature: string;
  studentId: string;
  sessionId: string;
  onValidationComplete: (success: boolean) => void;
}

export default function SignatureValidation({
  signature,
  studentId,
  sessionId,
  onValidationComplete,
}: SignatureValidationProps) {
  const { publicKey } = useWallet();
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!publicKey) return;

    setIsValidating(true);
    setValidationMessage(null);

    try {
      // Valider la signature
      const validation = validateSignature(signature, studentId, sessionId);
      
      if (validation.isValid) {
        // Sauvegarder la signature
        const signatureData: SignatureData = {
          signature,
          studentId,
          sessionId,
          timestamp: new Date().toISOString(),
        };

        const saved = await saveSignature(signatureData, publicKey);
        
        if (saved) {
          setValidationMessage('Signature validée et enregistrée avec succès');
          onValidationComplete(true);
        } else {
          setValidationMessage('Erreur lors de l\'enregistrement de la signature');
          onValidationComplete(false);
        }
      } else {
        setValidationMessage(validation.message);
        onValidationComplete(false);
      }
    } catch (error) {
      setValidationMessage('Une erreur est survenue lors de la validation');
      onValidationComplete(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 rounded-lg p-4">
        <img
          src={signature}
          alt="Signature de l'étudiant"
          className="max-w-full h-auto"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className={`px-4 py-2 rounded-lg text-white ${
            isValidating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isValidating ? 'Validation en cours...' : 'Valider la Signature'}
        </button>
      </div>

      {validationMessage && (
        <div
          className={`p-4 rounded-lg ${
            validationMessage.includes('succès')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {validationMessage}
        </div>
      )}
    </div>
  );
} 