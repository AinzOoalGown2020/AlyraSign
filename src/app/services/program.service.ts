import { Connection, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { config } from '@/config/param.config'

const connection = new Connection(config.solana.rpcUrl)
const programId = new PublicKey(config.solana.programId)

export const program = new Program(
  require('../../../target/idl/alyrasign.json'),
  programId,
  new AnchorProvider(connection, window.solana, { commitment: config.solana.commitment })
) 