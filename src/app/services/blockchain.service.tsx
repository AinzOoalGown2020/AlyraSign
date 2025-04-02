import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from '@solana/web3.js'
import { Candidate, Poll } from '../utils/interfaces'
import { store } from '../store'
import { globalActions } from '../store/globalSlices'
import { config } from '@/config/param.config'

let tx
const programId = new PublicKey(config.solana.programId)
const { setCandidates, setPoll } = globalActions
const RPC_URL = config.solana.rpcUrl

// IDL minimal pour le développement
const minimalIdl = {
  "version": "0.1.0",
  "name": "votee",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "registerations",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createStudentGroup",
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
    },
    {
      "name": "removeStudentsFromGroup",
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
    },
    {
      "name": "createPoll",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poll",
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
          "name": "description",
          "type": "string"
        },
        {
          "name": "start",
          "type": "i64"
        },
        {
          "name": "end",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "studentGroup",
      "type": {
        "kind": "struct",
        "fields": [
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
    },
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "start",
            "type": "i64"
          },
          {
            "name": "end",
            "type": "i64"
          },
          {
            "name": "candidates",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pollId",
            "type": "u64"
          },
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "votes",
            "type": "u64"
          },
          {
            "name": "hasRegistered",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "votes",
            "type": "u64"
          }
        ]
      }
    }
  ]
}

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program | null => {
  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected or missing signTransaction.')
    return null
  }

  const connection = new Connection(RPC_URL)
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: 'processed' }
  )

  return new Program(minimalIdl as any, programId, provider)
}

export const getReadonlyProvider = (): Program => {
  const connection = new Connection(RPC_URL, 'confirmed')

  // Use a dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
    signAllTransactions: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
  }

  const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: 'processed',
  })

  return new Program(minimalIdl as any, programId, provider)
}

export const getCounter = async (program: Program): Promise<BN> => {
  try {
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('counter')],
      program.programId
    )

    const counter = await program.account.counter.fetch(counterPDA)

    if (!counter) {
      console.warn('No counter found, returning zero')
      return new BN(0)
    }

    return counter.count
  } catch (error) {
    console.error('Failed to retrieve counter:', error)
    return new BN(-1)
  }
}

export const initialize = async (
  program: Program,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )
  const [registerationsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  tx = await program.methods
    .initialize()
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      registerations: registerationsPDA,
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

export const createPoll = async (
  program: Program,
  publicKey: PublicKey,
  nextCount: BN,
  description: string,
  start: number,
  end: number
): Promise<TransactionSignature> => {
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )
  const [pollPDA] = PublicKey.findProgramAddressSync(
    [nextCount.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  const startBN = new BN(start)
  const endBN = new BN(end)

  tx = await program.methods
    .createPoll(description, startBN, endBN)
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      poll: pollPDA,
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

export const registerCandidate = async (
  program: Program,
  publicKey: PublicKey,
  pollId: number,
  name: string
): Promise<TransactionSignature> => {
  const PID = new BN(pollId)
  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8)],
    programId
  )
  const [registerationsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  const regs = await program.account.registerations.fetch(registerationsPda)
  const CID = regs.count.add(new BN(1))

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8), CID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  tx = await program.methods
    .registerCandidate(PID, name)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      registerations: registerationsPda,
      candidate: candidatePda,
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

export const vote = async (
  program: Program,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId)
  const CID = new BN(candidateId)
  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8)],
    programId
  )
  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8), CID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  tx = await program.methods
    .vote(PID, CID)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      candidate: candidatePda,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}

export const fetchAllPolls = async (program: Program): Promise<Poll[]> => {
  const polls = await program.account.poll.all()
  return serializedPoll(polls)
}

export const fetchPollDetails = async (
  program: Program,
  pollAddress: string
): Promise<Poll> => {
  const poll = await program.account.poll.fetch(new PublicKey(pollAddress))
  return serializedPoll([poll])[0]
}

const serializedPoll = (polls: any[]): Poll[] =>
  polls.map((poll: any) => ({
    publicKey: poll.publicKey.toBase58(),
    id: poll.account.id.toNumber(),
    description: poll.account.description,
    start: poll.account.start.toNumber() * 1000,
    end: poll.account.end.toNumber() * 1000,
    candidates: poll.account.candidates.toNumber(),
  }))

export const fetchAllCandidates = async (
  program: Program,
  pollAddress: string
): Promise<Candidate[]> => {
  const candidates = await program.account.candidate.all([
    {
      memcmp: {
        offset: 0,
        bytes: new PublicKey(pollAddress).toBase58(),
      },
    },
  ])
  return serializedCandidates(candidates)
}

const serializedCandidates = (candidates: any[]): Candidate[] =>
  candidates.map((candidate: any) => ({
    publicKey: candidate.publicKey.toBase58(),
    cid: candidate.account.cid.toNumber(),
    pollId: candidate.account.pollId.toNumber(),
    name: candidate.account.name,
    votes: candidate.account.votes.toNumber(),
    hasRegistered: candidate.account.hasRegistered,
  }))

export const hasUserVoted = async (
  program: Program,
  publicKey: PublicKey,
  pollId: number
): Promise<boolean> => {
  const PID = new BN(pollId)
  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  const poll = await program.account.poll.fetch(pollPda)
  return poll.voters.includes(publicKey)
}

export const createStudentGroup = async (
  program: Program,
  admin: PublicKey,
  name: string,
  students: string[]
): Promise<TransactionSignature> => {
  try {
    console.log('Creating student group with params:', {
      admin: admin.toBase58(),
      name,
      studentsCount: students.length,
      students: students
    })

    // Vérifier que le nom est valide
    if (!name || name.length === 0) {
      throw new Error('Le nom du groupe ne peut pas être vide')
    }

    // Vérifier que les adresses des étudiants sont valides
    for (const student of students) {
      try {
        new PublicKey(student)
      } catch (error) {
        throw new Error(`Adresse étudiant invalide: ${student}`)
      }
    }

    // Utiliser un seed plus unique pour le PDA
    const [groupPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('student_group'), Buffer.from(name)],
      programId
    )

    console.log('Generated PDA:', groupPda.toBase58())

    // Vérifier si le groupe existe déjà
    try {
      const existingGroup = await program.account.studentGroup.fetch(groupPda)
      console.log('Group already exists:', existingGroup)
      throw new Error('Un groupe avec ce nom existe déjà')
    } catch (error: unknown) {
      // Si l'erreur est "Account does not exist", c'est bon
      if (error instanceof Error && !error.message.includes('Account does not exist')) {
        throw error
      }
    }

    // Vérifier le solde du compte admin
    const connection = new Connection(RPC_URL)
    const balance = await connection.getBalance(admin)
    console.log('Admin account balance:', balance / 1e9, 'SOL')

    // Vérifier que le compte admin a assez de SOL (au moins 1 SOL)
    if (balance < 1e9) {
      throw new Error('Le compte admin doit avoir au moins 1 SOL')
    }

    // Créer la transaction
    console.log('Creating transaction...')
    const tx = await program.methods
      .createStudentGroup(name, students, [])
      .accounts({
        admin,
        group: groupPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('Transaction sent:', tx)
    
    // Attendre la confirmation de la transaction
    const confirmation = await connection.confirmTransaction(tx, 'confirmed')
    console.log('Transaction confirmed:', confirmation)
    
    return tx
  } catch (error: unknown) {
    console.error('Error creating student group:', error)
    if (error && typeof error === 'object' && 'logs' in error) {
      console.error('Transaction logs:', (error as { logs: unknown }).logs)
    }
    throw error
  }
}

export const addStudentsToGroup = async (
  program: Program,
  admin: PublicKey,
  name: string,
  students: string[]
): Promise<TransactionSignature> => {
  const [groupPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('student_group'), Buffer.from(name)],
    programId
  )

  try {
    tx = await program.methods
      .addStudentsToGroup(name, students)
      .accounts({
        admin,
        group: groupPda,
      })
      .rpc()

    return tx
  } catch (error) {
    console.error('Error adding students to group:', error)
    throw error
  }
}

export const removeStudentsFromGroup = async (
  program: Program,
  admin: PublicKey,
  name: string,
  students: string[]
): Promise<TransactionSignature> => {
  const [groupPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('student_group'), Buffer.from(name)],
    programId
  )

  try {
    tx = await program.methods
      .removeStudentsFromGroup(name, students)
      .accounts({
        admin,
        group: groupPda,
      })
      .rpc()

    return tx
  } catch (error) {
    console.error('Error removing students from group:', error)
    throw error
  }
}

export const getStudentGroup = async (
  program: Program,
  name: string
): Promise<any> => {
  const [groupPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('student_group'), Buffer.from(name)],
    programId
  )

  try {
    const group = await program.account.studentGroup.fetch(groupPda)
    return group
  } catch (error) {
    console.error('Error fetching student group:', error)
    return null
  }
}

export const getAllStudentGroups = async (
  program: Program
): Promise<any[]> => {
  try {
    console.log('Fetching all student groups...')
    const groups = await program.account.studentGroup.all()
    console.log('Fetched groups:', groups)
    return groups.map((group: { account: { name: string; students: string[]; formations: string[] } }) => ({
      name: group.account.name,
      students: group.account.students,
      formations: group.account.formations
    }))
  } catch (error) {
    console.error('Error fetching all student groups:', error)
    return []
  }
}
