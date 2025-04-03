# AlyraSign - Application de Gestion des Présences

Application de gestion des présences pour les étudiants utilisant Solana et Anchor.

## Configuration de l'Administrateur

### Configuration de l'adresse Solana de l'administrateur

1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez la variable d'environnement suivante :
```env
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=votre_adresse_devnet_phantom
```

Remplacez `votre_adresse_devnet_phantom` par votre adresse Solana au format Base58 (par exemple : `5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG`).

### Vérification de la configuration

1. Assurez-vous que le fichier `.env.local` est bien créé
2. Vérifiez que l'adresse est correctement formatée
3. Redémarrez le serveur de développement si nécessaire


## Technologies utilisées

- Next.js
- Solana
- Anchor
- TypeScript
- TailwindCSS

## Fonctionnalités

- Création de formations
- Création de sessions dans chaque formation
- Enregistrement des présences
- Validation des présences

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

## Structure du Projet

```
src/
├── app/                  # Pages et routes principales
│   ├── admin/            # Interface administrateur
│   ├── student/          # Interface étudiant
│   ├── services/         # Services (blockchain, etc.)
│   ├── utils/            # Utilitaires
│   ├── store/            # État global
│   ├── hooks/            # Hooks personnalisés
│   ├── context/          # Contextes React
│   └── api/              # Routes API
├── components/           # Composants réutilisables
├── config/               # Configuration
├── idl/                  # Interface Definition Language
└── types/                # Types TypeScript
```


## Versions des Outils Principaux

Le projet est une application de vote sur Solana utilisant une architecture moderne avec Next.js pour le frontend et Anchor pour le programme (smart contract) Solana. Il implémente des fonctionnalités de vote avec gestion des PDA pour stocker les données sur la blockchain.

### Framework et Runtime
- Next.js : v14.1.0
- React : v18.2.0
- React DOM : v18.2.0
- TypeScript : v5.3.3

### Blockchain et Web3
- Solana Web3.js : v1.87.6
- Anchor : v0.30.1
- @project-serum/anchor : v0.26.0
- @coral-xyz/anchor : v0.30.1

### Gestion d'État et UI
- React Redux : v9.1.0
- @reduxjs/toolkit : v2.1.0
- React Query (TanStack) : v5.71.1
- React Toastify : v10.0.4

### Wallet et Intégration Solana
- @solana/wallet-adapter-base : v0.9.23
- @solana/wallet-adapter-react : v0.15.35
- @solana/wallet-adapter-react-ui : v0.9.34
- @solana/wallet-adapter-wallets : v0.19.23

### UI et Styling
- TailwindCSS : v3.4.1
- React Icons : v4.12.0
- @heroicons/react : v2.2.0

### Outils de Développement
- ESLint : v8.56.0
- PostCSS : v8.4.33
- Autoprefixer : v10.4.17

### Utilitaires
- bn.js : v5.2.1
- buffer : v6.0.3
- pino-pretty : v10.3.1

### Environnement
- RPC URL : Devnet Solana
- Program ID : FfEV5JPvSqajhtHQj2jUGvYz6GGNYkkMkHNhhE3rWqNp

## Licence

MIT

