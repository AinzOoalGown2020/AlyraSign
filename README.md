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

- Solana
- Anchor Framework
- Rust

## Licence

MIT

