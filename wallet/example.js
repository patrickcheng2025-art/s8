// 示例脚本 - 演示如何使用钱包功能
const {
  generateNewPrivateKey,
  createAccountFromPrivateKey,
  getEthBalance,
  getErc20Balance,
  sendErc20Transaction
} = require('./walletFunctions');

// Sepolia 测试网上的 LINK 代币地址
const LINK_TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789';

async function example() {
  console.log('='.repeat(80));
  console.log('钱包功能演示');
  console.log('='.repeat(80));

  // 1. 生成新私钥
  console.log('\n1. 生成新私钥');
  console.log('-'.repeat(80));
  const privateKey = generateNewPrivateKey();
  console.log(`私钥: ${privateKey}`);

  // 2. 从私钥创建账户
  console.log('\n2. 从私钥创建账户');
  console.log('-'.repeat(80));
  const account = createAccountFromPrivateKey(privateKey);
  console.log(`地址: ${account.address}`);

  // 3. 查询 ETH 余额
  console.log('\n3. 查询 ETH 余额');
  console.log('-'.repeat(80));
  try {
    const ethBalance = await getEthBalance(account.address);
    console.log(`ETH 余额: ${ethBalance} ETH`);
  } catch (error) {
    console.error('查询失败:', error.message);
  }

  // 4. 查询 ERC20 代币余额（以 LINK 为例）
  console.log('\n4. 查询 LINK 代币余额');
  console.log('-'.repeat(80));
  try {
    const { balance, symbol, decimals } = await getErc20Balance(
      account.address,
      LINK_TOKEN_ADDRESS
    );
    console.log(`${symbol} 余额: ${balance} ${symbol}`);
    console.log(`代币合约: ${LINK_TOKEN_ADDRESS}`);
    console.log(`小数位数: ${decimals}`);
  } catch (error) {
    console.error('查询失败:', error.message);
  }

  // 5. 发送 ERC20 代币示例（需要有余额才能执行）
  console.log('\n5. 发送 ERC20 代币示例');
  console.log('-'.repeat(80));
  console.log('注意: 需要账户有足够的 ETH 和代币余额才能发送交易');
  console.log('示例代码如下:');
  console.log(`
    const txHash = await sendErc20Transaction(
      privateKey,                                          // 发送者私钥
      '0x779877A7B0D9E8603169DdbD7836e478b4624789',      // LINK 代币地址
      '0x接收者地址',                                      // 接收者地址
      '1.5',                                               // 转账金额
      18                                                   // 代币小数位数
    );
  `);

  console.log('\n='.repeat(80));
  console.log('演示完成！');
  console.log('='.repeat(80));
  console.log('\n提示: 运行 "node index.js" 启动完整的命令行钱包');
}

// 运行示例
example().catch(console.error);
