import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, Connection } from '@solana/web3.js'
import { config } from '@/config/param.config'

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
) => {
  if (!admin) {
    throw new Error('Admin public key is required')
  }

  const groupPda = getGroupPda(program.programId, groupName)
  const connection = new Connection(config.solana.rpcUrl)

  try {
    console.log('Creating student group with params:', {
      admin: admin.toBase58(),
      groupName,
      studentsCount: students.length,
      students: students,
      programId: program.programId.toBase58(),
      groupPda: groupPda.toBase58(),
      rpcUrl: config.solana.rpcUrl
    })

    // Vérifier le solde du compte admin
    const balance = await connection.getBalance(admin)
    console.log('Admin account balance:', balance / 1e9, 'SOL')

    // Vérifier que le compte admin a assez de SOL (au moins 1 SOL)
    if (balance < 1e9) {
      throw new Error('Le compte admin doit avoir au moins 1 SOL')
    }

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

    console.log('Creating transaction...')
    const instruction = await program.methods
      .createStudentGroup(groupName, students, [])
      .accounts({
        admin,
        group: groupPda,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    console.log('Instruction created:', {
      programId: instruction.programId.toBase58(),
      keys: instruction.keys.map(key => ({
        pubkey: key.pubkey.toBase58(),
        isSigner: key.isSigner,
        isWritable: key.isWritable
      })),
      data: instruction.data.toString('base64')
    })

    const tx = await program.rpc.createStudentGroup(groupName, students, [], {
      accounts: {
        admin,
        group: groupPda,
        systemProgram: SystemProgram.programId,
      }
    })

    console.log('Transaction sent:', tx)
    
    // Attendre la confirmation
    const confirmation = await connection.confirmTransaction(tx, 'confirmed')
    console.log('Transaction confirmed:', confirmation)
    
    return tx
  } catch (error: unknown) {
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