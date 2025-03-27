# AlyraSign - Application de Gestion des Présences

Application de gestion des présences pour les étudiants utilisant Solana et Next.js.

## Prérequis

- Node.js 16.x ou supérieur
- Solana CLI
- Anchor Framework
- Compte Vercel

## Installation

1. Cloner le repository :
```bash
git clone [URL_DU_REPO]
cd alyra-sign
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
- Copier `.env.local.example` vers `.env.local`
- Mettre à jour les variables avec vos valeurs

4. Déployer le programme Solana :
```bash
cd anchor
anchor build
anchor deploy
```

5. Mettre à jour le PROGRAM_ID :
- Copier le PROGRAM_ID généré après le déploiement
- Mettre à jour la variable `NEXT_PUBLIC_PROGRAM_ID` dans `.env.local`

## Déploiement sur Vercel

1. Créer un nouveau projet sur Vercel :
- Aller sur [Vercel](https://vercel.com)
- Cliquer sur "New Project"
- Importer le repository GitHub

2. Configurer les variables d'environnement sur Vercel :
- `NEXT_PUBLIC_SOLANA_RPC_URL`: URL du réseau Solana (devnet/mainnet)
- `NEXT_PUBLIC_PROGRAM_ID`: ID du programme Solana déployé

3. Déployer :
- Cliquer sur "Deploy"

## Structure du Projet

```
alyra-sign/
├── anchor/                 # Programme Solana
│   └── programs/
│       └── alyra-sign/    # Code du programme
├── src/
│   └── app/               # Application Next.js
│       ├── components/    # Composants React
│       ├── hooks/        # Hooks personnalisés
│       ├── services/     # Services (Solana, etc.)
│       └── pages/        # Pages de l'application
├── public/               # Fichiers statiques
└── package.json         # Dépendances et scripts
```

## Fonctionnalités

- Création et gestion des formations
- Création et gestion des sessions
- Signature électronique des présences
- Validation des signatures par les administrateurs
- Interface utilisateur intuitive

## Technologies Utilisées

- Next.js
- Solana
- Anchor Framework
- TypeScript
- Tailwind CSS

## Licence

MIT
