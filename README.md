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

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Démarrage en production

```bash
npm start
```

## Technologies utilisées

- Next.js
- Solana
- Anchor
- TypeScript
- TailwindCSS

## Fonctionnalités

- Création de formations
- Création de sessions
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
alyra-sign/
├── programs/
│   └── alyrasign/        # Programme Solana
│       └── src/         # Code source du programme
├── tests/               # Tests du programme
└── Anchor.toml         # Configuration Anchor
```

## Technologies Utilisées

Le projet est une application de vote sur Solana utilisant une architecture moderne avec Next.js pour le frontend et Anchor pour le smart contract Solana. Il implémente des fonctionnalités de vote avec gestion des PDA pour stocker les données sur la blockchain.

Voici les détails des outils et technologies utilisés dans ce projet :

1. **PDA (Program Derived Addresses)** :
- Exemples de PDA utilisés :
  - `counterPDA` pour le compteur
  - `pollPDA` pour les sondages
  - `candidatePDA` pour les candidats
  - `registerationsPDA` pour les inscriptions

2. **Solana Web3.js** :
- Version utilisée : `@solana/web3.js` v1.87.6
- Utilisé pour les interactions avec la blockchain Solana

3. **React Toastify** :
- Oui, version 10.0.4
- Utilisé pour les notifications dans l'interface utilisateur

4. **Frameworks** :
- Next.js v14.1.0 (Framework React)
- React v18.2.0
- TailwindCSS v3.4.1 (Framework CSS)

5. **Librairies Backend** :
- `@coral-xyz/anchor` v0.28.0 (Framework de développement Solana)
- `@solana/wallet-adapter-base` v0.9.23
- `@solana/wallet-adapter-react` v0.15.35
- `@solana/wallet-adapter-react-ui` v0.9.34
- `@solana/wallet-adapter-wallets` v0.19.23
- `bn.js` v5.2.1 (Pour les opérations sur les grands nombres)
- `buffer` v6.0.3

6. **Librairies Frontend** :
- `react-icons` v4.12.0
- `react-redux` v9.1.0
- `@reduxjs/toolkit` v2.1.0

7. **Outils de développement** :
- TypeScript v5.3.3
- ESLint v8.56.0
- PostCSS v8.4.33
- Autoprefixer v10.4.17

8. **Programme Solana** :
- Anchor v0.24.2
- Solana Program v1.9.13

9. **Déploiement** :
- GitHub Actions pour les tests et le build

10. **Environnement** :
- RPC URL : Devnet Solana
- Program ID : FfEV5JPvSqajhtHQj2jUGvYz6GGNYkkMkHNhhE3rWqNp

## Licence

MIT

