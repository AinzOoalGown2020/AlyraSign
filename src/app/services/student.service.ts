import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { 
  PublicKey, 
  SystemProgram, 
  Connection, 
  TransactionInstruction, 
  AccountMeta, 
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  Keypair 
} from '@solana/web3.js'
import { config } from '@/config/param.config'
import { useWallet } from '@solana/wallet-adapter-react'

export interface StudentGroup {
  name: string
  students: string[]
  formations: string[]
}

const getGroupPda = (programId: PublicKey, groupName: string): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('student_group'), Buffer.from(groupName)],
    programId
  )
  console.log('Generated PDA:', {
    programId: programId.toBase58(),
    groupName,
    pda: pda.toBase58(),
    seeds: ['student_group', groupName]
  })
  return pda
}

export const createStudentGroup = async (
  program: Program,
  admin: PublicKey,
  groupName: string,
  students: string[]
): Promise<string> => {
  if (!program.provider.wallet || !program.provider.wallet.publicKey) {
    throw new Error('Wallet non initialisé')
  }

  const groupPda = getGroupPda(program.programId, groupName)
  const connection = program.provider.connection

  try {
    console.log('Creating student group with params:', {
      admin: admin.toBase58(),
      groupName,
      studentsCount: students.length,
      students: students,
      programId: program.programId.toBase58(),
      groupPda: groupPda.toBase58(),
      providerWallet: program.provider.wallet.publicKey.toBase58()
    })

    // Vérifier le solde du compte admin
    const balance = await connection.getBalance(admin)
    console.log('Admin account balance:', balance / 1e9, 'SOL')

    // Vérifier que le compte admin a assez de SOL
    if (balance < 1e9) {
      throw new Error('Le compte admin doit avoir au moins 1 SOL')
    }

    console.log('Creating instruction...')

    // Utiliser directement la méthode rpc() d'Anchor
    const signature = await program.methods
      .createStudentGroup(groupName, students, [])
      .accounts({
        authority: program.provider.wallet.publicKey, // Utiliser le wallet du provider
        group: groupPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc({
        commitment: 'confirmed'
      })

    console.log('Transaction sent:', signature)

    // Attendre la confirmation
    const confirmation = await connection.confirmTransaction(
      signature,
      'confirmed'
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    console.log('Transaction confirmed:', confirmation)

    // Vérifier que le groupe a été créé
    try {
      const newGroup = await program.account.studentGroup.fetch(groupPda)
      console.log('New group created successfully:', newGroup)
    } catch (error) {
      console.error('Failed to fetch new group:', error)
      throw new Error('Le groupe a été créé mais impossible de le vérifier')
    }

    return signature
  } catch (error) {
    console.error('Error creating student group:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

export const addStudentsToGroup = async (
  program: Program,
  admin: PublicKey,
  groupName: string,
  students: string[]
) => {
  const groupPda = getGroupPda(program.programId, groupName)

  try {
    const tx = await program.methods
      .addStudentsToGroup(groupName, students)
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
  groupName: string,
  students: string[]
) => {
  const groupPda = getGroupPda(program.programId, groupName)

  try {
    const tx = await program.methods
      .removeStudentsFromGroup(groupName, students)
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
  groupName: string
): Promise<StudentGroup | null> => {
  const groupPda = getGroupPda(program.programId, groupName)

  try {
    const group = await program.account.studentGroup.fetch(groupPda)
    return group as unknown as StudentGroup
  } catch (error) {
    console.error('Error fetching student group:', error)
    return null
  }
}

export const getAllStudentGroups = async (
  program: Program
): Promise<StudentGroup[]> => {
  try {
    console.log('Fetching all student groups...')
    const groups = await program.account.studentGroup.all()
    console.log('Fetched groups:', groups)
    return groups.map((group: { account: { name: string; students: string[]; formations: string[] } }) => ({
      name: group.account.name,
      students: group.account.students,
      formations: group.account.formations
    }))
  } catch (error: unknown) {
    console.error('Error fetching all student groups:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    return []
  }
} 