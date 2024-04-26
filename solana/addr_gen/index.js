#!/usr/bin/env node

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { Command } = require('commander');
const { Keypair } = require('@solana/web3.js');
// 创建一个新的命令
const program = new Command();
program.name('addr_gen').version('1.0.0');
program
    .option('-p, --prefix <prefix>', 'Address prefix to search for', '000')
    .option('-w, --worker <worker>', 'Search workers number', '20')
    .parse(process.argv);
const options = program.opts();// 解析命令行参数
const prefix = options.prefix;
const workers = options.worker;

// 如果是主线程
if (isMainThread) {
    let addressFound = false; // 标志是否已经找到了满足条件的地址
    const workerArray = []; // 存储工作线程的数组
    for (let i = 0; i < workers; i++) {   // 创建多个子线程
        const worker = new Worker(__filename, {
            workerData: { prefix }
        });
        workerArray.push(worker);// 将工作线程存储到数组中
        worker.on('message', message => {// 监听子线程的消息
            if (!addressFound) {
                console.log(message);
                addressFound = true;
                workerArray.forEach(worker => {// 如果已经找到了满足条件的地址，则向所有子线程发送终止消息
                    worker.postMessage('terminate');
                });
                process.exit();
            }
        });
        worker.on('error', err => {// 监听子线程的错误
            console.error(err);
        });
    }
} else { // 如果是子线程
    const { prefix } = workerData;// 获取子线程的参数
    function generateAddressWithPrefix(prefix) {// 生成 Solana 地址和私钥
        console.log(`Searching for Solana address with prefix: ${prefix} ...\r\n`);
        let found = false;
        let address, privateKey;
        while (!found) { // 直到找到适合的地址为止
            const keypair = Keypair.generate();
            address = keypair.publicKey.toBase58();
            if (address.startsWith(prefix)) {
                privateKey = Buffer.from(keypair.secretKey).toString('hex');
                found = true;
            }
        }
        return {
            address: `${address}`,
            privateKey: `${privateKey}`
        };
    }
    parentPort.on('message', message => {// 监听来自主线程的终止消息
        if (message === 'terminate') {
            console.log('terminate worker.')
            process.exit();
        }
    });
    const result = generateAddressWithPrefix(prefix); // 生成地址和私钥
    parentPort.postMessage(result);// 发送结果给主线程
}
