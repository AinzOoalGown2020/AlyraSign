import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export const getGroupPda = (program: Program, groupName: string): PublicKey => {
  const [pda, _bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('student_group'), Buffer.from(groupName)],
    program.programId
  );
  
  console.log('Generated PDA:', {
    programId: program.programId.toBase58(),
    groupName,
    pda: pda.toBase58(),
    seeds: ['student_group', groupName]
  });
  
  return pda;
}; 