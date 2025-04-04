export const config = {
  // Configuration de base
  appName: 'AlyraSign',
  version: '1.0.0',
  
  // Configuration du stockage
  storage: {
    prefix: 'alyrSign_',
    expiration: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
  },
  
  // Configuration des dates
  dateFormat: {
    display: 'DD/MM/YYYY',
    input: 'YYYY-MM-DD',
  },
  
  // Configuration des sessions
  session: {
    defaultDuration: 120, // durée par défaut en minutes
    minDuration: 30, // durée minimale en minutes
    maxDuration: 480, // durée maximale en minutes
  },
} 