#!/usr/bin/env node

// 引入必要的库
const { Command } = require('commander');
const WebSocket = require('ws');

// 创建一个新的命令
const program = new Command();

// 设置命令的名称和版本号
program.name('solrpc_ws').version('1.0.0');

// 添加命令选项和参数
program
    .arguments('<url>')
    .option('-d, --data <data>', 'Specify JSON data')
    .parse(process.argv);
program.parse()

// 获取命令行参数
const url = program.args[0];
const data = program.getOptionValue('data');
console.log('Address:', url);
console.log('Parameters:', data);
console.log('Connecting to the WebSocket server...\r\n');

// 如果缺少参数则显示帮助信息
if (!url || !data) {
    program.help();
}

// 连接到 WebSocket 服务器
const ws = new WebSocket(url);

// 监听连接事件
ws.on('open', function open() {
    console.log(`Connected to ${url} \r\n`);
    // 发送数据
    ws.send(data);
    // 设置定时器，每隔一段时间发送一个心跳消息
    setInterval(() => {
        ws.send(data);
    }, 30000); // 每隔 30 秒发送一次心跳消息
});

// 监听消息事件
ws.on('message', function incoming(message) {
    // 如果消息是 Buffer 类型，则将其转换成字符串
    if (message instanceof Buffer) {
        message = message.toString();
    }
    console.log(message);
});

// 监听错误事件
ws.on('error', function error(error) {
    console.error('WebSocket Error:', error);
});


///UseAge
// solrpc_ws ws://api.devnet.solana.com -d '{"jsonrpc": "2.0", "id": 1, "method": "accountSubscribe", "params": ["F3jMVgLRa1XQayTXjwiYU7H5CetHU646NNK58CKdDgjM", {"encoding": "jsonParsed", "commitment": "finalized"}]}'