#!/usr/bin/env node

require('dotenv').config();
const { Keypair,
    Transaction,
    Connection,
    SystemProgram,
    clusterApiUrl,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
    PublicKey
} = require('@solana/web3.js');

const endpoint = clusterApiUrl("testnet") // clusterApiUrl("devnet")
const privateKey = process.env.PRIVATE_KEY; // 读取配置文件中的私钥
const keypair = getKeypairFromPrivateKey(privateKey); // 通过私钥生成密钥对
const toAccount = new PublicKey('9rvEosStmcpVQKvcSGmfcTffFBEsSW5B7ziQihcSqSqQ');// 目标地址
(
    async () => {
        let connection = new Connection(endpoint);
        console.log(`Connection to cluster: ${connection.rpcEndpoint} ...`);

        const balanceLamports = await connection.getBalance(keypair.publicKey);
        const balanceToAccountLamports = await connection.getBalance(toAccount);
        console.log(`from account Balance: ${balanceLamports / LAMPORTS_PER_SOL} SOL`);
        console.log(`to account Balance: ${balanceToAccountLamports / LAMPORTS_PER_SOL} SOL`);
        let tx = new Transaction();// 创建一个交易单

        tx.add(//设置交易单数据
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: toAccount,
                lamports: 10000000,
            }),
        );
        tx.recentBlockhash = (
            await connection.getLatestBlockhash('max')
        ).blockhash;

        tx.feePayer = keypair.publicKey;
        // 等待第一个操作完成后执行第二个操作
        sendAndConfirmTransaction(connection, tx, [keypair]).then(async (result) => {
            console.log(result);
            
            console.log(`Transfer 0.01 SOL to ${toAccount.toBase58()} ...`);
            const balanceLamports2 = await connection.getBalance(keypair.publicKey);
            const balanceToAccountLamports2 = await connection.getBalance(toAccount);
            console.log(`from account Balance: ${balanceLamports2 / LAMPORTS_PER_SOL} SOL`);
            console.log(`to account Balance: ${balanceToAccountLamports2 / LAMPORTS_PER_SOL} SOL`);
        });
    }
)();

/// 通过私钥生成地址和密钥对
function getKeypairFromPrivateKey(privateKey) {
    const buffer = Buffer.from(privateKey, 'hex');
    const secretKey = new Uint8Array(buffer);
    let keypair = Keypair.fromSecretKey(secretKey);
    return keypair;
}
