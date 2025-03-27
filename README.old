# AlyraSign: Une Application de Signature Décentralisée

**AlyraSign** est une application de signature décentralisée construite sur la blockchain Solana, permettant aux utilisateurs de créer et de gérer des signatures de manière transparente et sécurisée. Elle utilise des technologies modernes et l'infrastructure blockchain pour fournir une expérience de signature interactive et décentralisée.

## Fonctionnalités

- **Création de Documents**: Les utilisateurs peuvent créer des documents à signer avec descriptions et dates limites.
- **Gestion des Signatures**: Les utilisateurs peuvent signer des documents et suivre leur statut.
- **Mises à jour en Temps Réel**: Les détails des documents et les statuts des signatures sont récupérés directement depuis la blockchain.
- **Intégration Wallet**: Connexion et interaction transparentes avec des wallets compatibles Solana comme Phantom.
- **Notifications Toast**: Retour sur les transactions, incluant les statuts de succès, en attente ou d'échec.

---

## Pages

### 1. **Homepage**
   - Displays a welcome interface and navigation links for creating polls or voting.

### 2. **Create Poll Page**
   - Form-based interface for creating new polls with fields for:
     - **Poll Description**: A brief description of the poll's purpose.
     - **Start Date**: The start date and time of the poll.
     - **End Date**: The end date and time of the poll.

### 3. **Register Candidate Modal**
   - Allows candidates to register for a specific poll.
   - Input field for entering the candidate's name.
   - Accessible through an active poll's detail page.

### 4. **Voting Page**
   - Displays active polls and their registered candidates.
   - Allows users to vote for their preferred candidate.
   - Displays real-time voting statistics for transparency.
---
![image](https://github.com/user-attachments/assets/c13b9342-02e7-4208-ae73-cfea0d24ae90)
---

## Technologies Used

- **Frontend**:
  - Next.js
  - TypeScript
  - React
  - Redux Toolkit
  - Tailwind CSS
  - React Icons
- **Blockchain Integration**:
  - Solana Web3.js
  - @coral-xyz/anchor
  - Solana Wallet Adapter
  - Phantom Wallet
- **Notifications**:
  - React Toastify

---

## Important Note

**Wallet Required**: Before using this dApp, ensure you have a Solana-compatible wallet like Phantom installed. You can download it [here](https://phantom.app/).

**Default Solana Cluster**: The application assumes a local Solana network for development. Ensure your Solana CLI is set to the correct cluster.

```bash
solana config set --url http://127.0.0.1:8899
```

## Installation Guide
1. Cloner le Repository

```bash
git clone https://github.com/votre-nom/alyra-sign.git
cd alyra-sign
```

2. Install Dependencies
```bash
npm install
```

3. Set Up Environment Variables
Create a .env file in the root directory and add the following variable for local development:

```sh
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8899
```

4. Run Local Solana Test Validator
If not already running, start a Solana test validator on your local machine:

```sh
solana-test-validator
```

5. Launch the Development Server
```sh
npm run dev
```

6. Build for Production
For production, build and start the application:

```sh
npm run build
npm start
```

## Usage
* Open the application in your browser: http://localhost:3000.
    * Connect your wallet using the Wallet Adapter button.
    * Create a poll, register candidates, and vote directly on the blockchain.

* pages/:
    * index.tsx: Homepage.
    * create.tsx: Poll creation page.

* services/:
    * blockchain.service.ts: Functions for interacting with the blockchain (e.g., createPoll, registerCandidate).

* utils/:
    * Types and helper functions for application logic.

## Contributing
Contributions are welcome! If you have suggestions, feature requests, or bug reports, please create an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
