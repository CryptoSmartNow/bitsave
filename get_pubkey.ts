import * as anchor from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
require('dotenv').config();

const secret = process.env.MINT_AUTHORITY_SECRET;
const kp = Keypair.fromSecretKey(bs58.decode(secret as string));
console.log("Mint Authority Pubkey:", kp.publicKey.toBase58());
