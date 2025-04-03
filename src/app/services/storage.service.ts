import { config } from '@/config/param.config'

const STORAGE_KEYS = {
  FORMATIONS: 'formations',
  SESSIONS: 'sessions',
  SIGNATURES: 'signatures',
} as const

export const storageService = {
  // Formations
  getFormations: () => {
    if (typeof window === 'undefined') return []
    const formations = localStorage.getItem(STORAGE_KEYS.FORMATIONS)
    return formations ? JSON.parse(formations) : []
  },

  getFormation: (id: string) => {
    if (typeof window === 'undefined') return null
    const formations = localStorage.getItem(STORAGE_KEYS.FORMATIONS)
    const allFormations = formations ? JSON.parse(formations) : []
    return allFormations.find((f: any) => f.id === id) || null
  },

  saveFormation: (formation: any) => {
    if (typeof window === 'undefined') return
    const formations = localStorage.getItem(STORAGE_KEYS.FORMATIONS)
    const allFormations = formations ? JSON.parse(formations) : []
    allFormations.push(formation)
    localStorage.setItem(STORAGE_KEYS.FORMATIONS, JSON.stringify(allFormations))
    return formation
  },

  updateFormation: (id: string, updatedFormation: any) => {
    if (typeof window === 'undefined') return
    const formations = storageService.getFormations()
    const index = formations.findIndex((f: any) => f.id === id)
    if (index !== -1) {
      formations[index] = { ...formations[index], ...updatedFormation }
      localStorage.setItem(STORAGE_KEYS.FORMATIONS, JSON.stringify(formations))
      return formations[index]
    }
    return null
  },

  deleteFormation: (id: string) => {
    if (typeof window === 'undefined') return
    const formations = storageService.getFormations()
    const filtered = formations.filter((f: any) => f.id !== id)
    localStorage.setItem(STORAGE_KEYS.FORMATIONS, JSON.stringify(filtered))
  },

  // Sessions
  getSessions: (formationId: string) => {
    if (typeof window === 'undefined') return []
    const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    const allSessions = sessions ? JSON.parse(sessions) : []
    return allSessions.filter((s: any) => s.formationId === formationId)
  },

  saveSession: (session: any) => {
    if (typeof window === 'undefined') return
    const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    const allSessions = sessions ? JSON.parse(sessions) : []
    allSessions.push(session)
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions))
    return session
  },

  deleteSession: (sessionId: string) => {
    if (typeof window === 'undefined') return
    const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    const allSessions = sessions ? JSON.parse(sessions) : []
    const filtered = allSessions.filter((s: any) => s.id !== sessionId)
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered))
  },

  // Signatures
  getSignatures: (sessionId: string) => {
    if (typeof window === 'undefined') return []
    const signatures = localStorage.getItem(STORAGE_KEYS.SIGNATURES)
    const allSignatures = signatures ? JSON.parse(signatures) : []
    return allSignatures.filter((s: any) => s.sessionId === sessionId)
  },

  saveSignature: (signature: any) => {
    if (typeof window === 'undefined') return
    const signatures = localStorage.getItem(STORAGE_KEYS.SIGNATURES)
    const allSignatures = signatures ? JSON.parse(signatures) : []
    allSignatures.push(signature)
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(allSignatures))
    return signature
  },

  // Nettoyage
  clearAll: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.FORMATIONS)
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
    localStorage.removeItem(STORAGE_KEYS.SIGNATURES)
  },
} 