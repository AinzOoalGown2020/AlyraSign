# AlyraSign

Programme de gestion des présences sur Solana développé avec Anchor.

## Fonctionnalités

- Création de formations
- Création de sessions
- Enregistrement des présences
- Validation des présences

## Installation

```bash
git clone https://github.com/AinzOoalGown2020/AlyraSign.git
cd alyrasign
yarn install
```

## Build

```bash
anchor build
```

## Test

```bash
anchor test
```

## Structure du Programme

Le programme contient quatre instructions principales :

1. `create_formation` - Créer une nouvelle formation
2. `create_session` - Créer une nouvelle session pour une formation
3. `register_presence` - Enregistrer la présence d'un étudiant
4. `validate_presence` - Valider la présence d'un étudiant

## Comptes

- `Formation` - Stocke les informations sur une formation
- `Session` - Stocke les informations sur une session
- `Presence` - Stocke les informations sur la présence d'un étudiant

## Prérequis

- Rust
- Solana CLI
- Anchor Framework
- Node.js
- Yarn

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

## Technologies Utilisées

- Next.js
- Solana
- Anchor Framework
- TypeScript
- Tailwind CSS
## Licence

MIT

