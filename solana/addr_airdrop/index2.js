#!/usr/bin/env node

require('dotenv').config();
const { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const endpoint = clusterApiUrl("testnet") // clusterApiUrl("devnet")
const privateKey = process.env.PRIVATE_KEY; // 读取配置文件中的私钥
const keypair = getKeypair(privateKey); // 通过私钥生成密钥对

(
    async () => {
        let connection = new Connection(endpoint);
        console.log(`Connection to cluster: ${connection.rpcEndpoint} ...`);

        let slot = await connection.getSlot();
        console.log('Current Slot:', slot);

        let signature = await connection.requestAirdrop(
            keypair.publicKey,
            LAMPORTS_PER_SOL,
        );
        await connection.confirmTransaction({ signature: signature });
        console.log('Airdrop signature:', signature);
    }
)();

/// 通过私钥生成地址和密钥对
function getKeypair(privateKey) {
    const buffer = Buffer.from(privateKey, 'hex');
    const secretKey = new Uint8Array(buffer);
    let keypair = Keypair.fromSecretKey(secretKey);
    return keypair;
}