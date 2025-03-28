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

