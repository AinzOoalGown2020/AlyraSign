'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { config } from '@/config/param.config'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { getProvider } from '@/app/services/blockchain.service'
import {
  createStudentGroup,
  getAllStudentGroups,
  StudentGroup
} from '@/app/services/student.service'

export default function StudentsManagement() {
  const router = useRouter()
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [currentGroup, setCurrentGroup] = useState<StudentGroup>({
    name: '',
    students: [],
    formations: []
  })
  const [isLoading, setIsLoading] = useState(false)

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const isValidSolanaAddress = useCallback((address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }, [])

  const parseFileContent = useCallback((content: string) => {
    const lines = content.split('\n')
    const students: string[] = []
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && isValidSolanaAddress(trimmedLine)) {
        students.push(trimmedLine)
      }
    })

    setCurrentGroup(prev => ({
      ...prev,
      students: [...prev.students, ...students]
    }))
  }, [isValidSolanaAddress])

  const fetchGroups = useCallback(async () => {
    if (!program) return
    try {
      const fetchedGroups = await getAllStudentGroups(program)
      setGroups(fetchedGroups)
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Erreur lors du chargement des groupes')
    }
  }, [program])

  useEffect(() => {
    if (program) {
      fetchGroups()
    }
  }, [program, fetchGroups])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGroup(prev => ({
      ...prev,
      name: e.target.value
    }))
  }, [])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      parseFileContent(content)
    }
    reader.readAsText(file)
  }, [parseFileContent])

  const handleAddGroup = useCallback(async () => {
    if (!currentGroup.name || currentGroup.students.length === 0) {
      toast.error('Veuillez remplir le nom du groupe et ajouter des étudiants')
      return
    }

    if (!program || !publicKey) {
      toast.error('Erreur de connexion au wallet')
      return
    }

    setIsLoading(true)
    try {
      console.log('Starting group creation process...')
      console.log('Current group data:', currentGroup)
      
      const invalidAddresses = currentGroup.students.filter(addr => !isValidSolanaAddress(addr))
      if (invalidAddresses.length > 0) {
        toast.error(`Adresses invalides trouvées: ${invalidAddresses.join(', ')}`)
        return
      }

      await toast.promise(
        createStudentGroup(program, publicKey, currentGroup.name, currentGroup.students),
        {
          pending: 'Création du groupe en cours...',
          success: 'Groupe créé avec succès 🎉',
          error: 'Erreur lors de la création du groupe 🤯'
        }
      )
      
      const updatedGroups = await getAllStudentGroups(program)
      setGroups(updatedGroups)
      
      setCurrentGroup({
        name: '',
        students: [],
        formations: []
      })
      
      toast.success('Groupe créé avec succès !')
    } catch (error: unknown) {
      console.error('Error in handleAddGroup:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du groupe'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [currentGroup, program, publicKey, isValidSolanaAddress])

  const handleRemoveStudent = useCallback((index: number) => {
    setCurrentGroup(prev => ({
      ...prev,
      students: prev.students.filter((_, i) => i !== index)
    }))
  }, [])

  // Vérification si l'utilisateur est admin
  if (!publicKey || publicKey.toBase58() !== config.solana.adminWalletAddress) {
    if (typeof window !== 'undefined') {
      router.push('/')
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Étudiants</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter un nouveau groupe</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du groupe
          </label>
          <input
            type="text"
            value={currentGroup.name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded"
            placeholder="Ex: Formation Web3 2024"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Importer des étudiants
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100"
            />
            <p className="text-sm text-gray-500">
              Formats acceptés: .txt, .csv (une adresse par ligne)
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Étudiants ajoutés
          </label>
          <div className="space-y-2">
            {currentGroup.students.map((student, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="font-mono text-sm">{student}</span>
                <button
                  onClick={() => handleRemoveStudent(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddGroup}
          disabled={isLoading}
          className={`bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Création en cours...' : 'Ajouter le groupe'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Groupes existants</h2>
        <div className="space-y-4">
          {groups.map((group, index) => (
            <div key={index} className="border rounded p-4">
              <h3 className="font-semibold mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {group.students.length} étudiants
              </p>
              <div className="space-y-1">
                {group.students.map((student, studentIndex) => (
                  <div key={studentIndex} className="font-mono text-sm">
                    {student}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 