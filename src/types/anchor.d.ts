declare module '@coral-xyz/anchor' {
  import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js'
  import { BN } from 'bn.js'

  export class Program {
    constructor(idl: any, programId: PublicKey, provider: AnchorProvider)
    programId: PublicKey
    provider: AnchorProvider
    account: any
    methods: any
  }

  export class AnchorProvider {
    constructor(connection: Connection, wallet: Wallet, opts: any)
    connection: Connection
    wallet: Wallet
  }

  export interface Wallet {
    publicKey: PublicKey
    signTransaction: (tx: any) => Promise<any>
    signAllTransactions: (txs: any[]) => Promise<any[]>
  }

  export class BN {
    constructor(number: number | string)
    toNumber(): number
    toArrayLike(type: any, endian: string, length: number): Buffer
    add(other: BN): BN
  }
} 