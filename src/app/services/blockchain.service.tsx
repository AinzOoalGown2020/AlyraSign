import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
  Transaction,
  SendOptions,
  Keypair,
  VersionedTransaction,
} from '@solana/web3.js'
import { store } from '../store'
import { globalActions } from '../store/globalSlices'
import { config } from '@/config/param.config'

let tx
const programId = new PublicKey(config.solana.programId)
const RPC_URL = config.solana.rpcUrl

// IDL minimal pour le développement
const minimalIdl = {
  "version": "0.1.0",
  "name": "alyrasign",
  "instructions": [
    {
      "name": "createStudentGroup",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "students",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "formations",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "addStudentsToGroup",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "students",
          "type": {
            "vec": "string"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "studentGroup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "students",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "formations",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    }
  ]
}

// Définir une interface personnalisée pour le wallet
interface CustomWallet extends Wallet {
  sendTransaction: (transaction: Transaction, connection: Connection, options?: SendOptions) => Promise<string>;
  signAllTransactions: (txs: any[]) => Promise<any[]>;
}

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | null,
  sendTransaction: ((transaction: Transaction, connection: Connection, options?: SendOptions) => Promise<string>) | null
): Program | null => {
  if (!publicKey || !signTransaction || !sendTransaction) return null

  const connection = new Connection(RPC_URL, 'confirmed')
  const wallet = {
    publicKey,
    signTransaction,
    sendTransaction: async (transaction: Transaction) => {
      return sendTransaction(transaction, connection)
    },
    signAllTransactions: async (transactions: any[]) => {
      return Promise.all(transactions.map(tx => signTransaction(tx)))
    }
  } as CustomWallet

  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  })

  return new Program(minimalIdl, programId, provider)
}

export const getReadonlyProvider = (): Program | null => {
  const connection = new Connection(RPC_URL, 'confirmed')
  const wallet = Keypair.generate()
  const provider = new AnchorProvider(connection, wallet as any, {
    preflightCommitment: 'confirmed',
  })

  return new Program(minimalIdl, programId, provider)
}

export const getCounter = async (program: Program): Promise<BN> => {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )
  const counter = await program.account.counter.fetch(counterPda)
  return counter.count
}

export const initialize = async (
  program: Program,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )

  tx = await program.methods
    .initialize()
    .accountsPartial({
      authority: publicKey,
      counter: counterPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}
