'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { validateSignature, saveSignature, SignatureData } from '../services/signature.service';
import type { SignatureValidation } from '../services/signature.service';
import Image from 'next/image'
import { config } from '@/config/param.config'
import { Connection } from '@solana/web3.js';
import { program as programInstance } from '../services/program.service';

interface SignatureValidationProps {
  signature: string;
  studentId: string;
  sessionId: string;
  timestamp: string;
  onValidationComplete: (success: boolean) => void;
}

export default function SignatureValidation({
  signature,
  studentId,
  sessionId,
  timestamp,
  onValidationComplete,
}: SignatureValidationProps) {
  const { publicKey } = useWallet();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  const handleValidate = async () => {
    if (!publicKey) return;

    setIsValidating(true);
    try {
      const validation = validateSignature(signature, studentId, sessionId);
      setValidationResult(validation.isValid);

      if (validation.isValid) {
        const signatureData: SignatureData = {
          signature,
          studentId,
          sessionId,
          timestamp,
          nom: '', // À remplir avec les données de l'étudiant
          prenom: '', // À remplir avec les données de l'étudiant
        };
        await saveSignature(signatureData, publicKey, new Connection(config.solana.rpcUrl), programInstance);
        onValidationComplete(true);
      } else {
        onValidationComplete(false);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setValidationResult(false);
      onValidationComplete(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 rounded-lg p-4">
        <Image 
          src={signature} 
          alt="Signature"
          width={300}
          height={200}
          className="max-w-full h-auto"
        />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">ID Étudiant: {studentId}</p>
          <p className="text-sm text-gray-600">Session: {sessionId}</p>
          <p className="text-sm text-gray-600">Date: {timestamp}</p>
        </div>

        <button
          onClick={handleValidate}
          disabled={isValidating || !publicKey}
          className={`px-4 py-2 rounded ${
            isValidating
              ? 'bg-gray-400'
              : validationResult === true
              ? 'bg-green-500'
              : validationResult === false
              ? 'bg-red-500'
              : 'bg-blue-500'
          } text-white hover:opacity-90 transition-opacity`}
        >
          {isValidating
            ? 'Validation en cours...'
            : validationResult === true
            ? 'Signature Validée'
            : validationResult === false
            ? 'Signature Invalide'
            : 'Valider la Signature'}
        </button>
      </div>
    </div>
  );
} 