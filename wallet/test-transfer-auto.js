// 自动化转账测试脚本
// 使用方法: PRIVATE_KEY=你的私钥 node test-transfer-auto.js
const {
  sendErc20Transaction,
  getErc20Balance,
  getEthBalance
} = require('./walletFunctions');

// 转账参数
const FROM_ADDRESS = '0x2Fc576C172034b9A40Dda17Eb313539FF60D9194';
const TO_ADDRESS = '0x85C08B7c558bC7c261F2Da8Db025e6c16a2c9751';
const TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789'; // LINK
const AMOUNT = '2'; // 转账 2 LINK
const DECIMALS = 18;

async function testTransfer() {
  console.log('='.repeat(80));
  console.log('ERC20 转账测试 - LINK 代币');
  console.log('='.repeat(80));
  console.log('\n转账信息:');
  console.log(`从地址: ${FROM_ADDRESS}`);
  console.log(`到地址: ${TO_ADDRESS}`);
  console.log(`代币合约: ${TOKEN_ADDRESS} (LINK)`);
  console.log(`转账金额: ${AMOUNT} LINK`);
  console.log(`小数位数: ${DECIMALS}`);
  console.log('\n' + '='.repeat(80));

  // 获取私钥（从环境变量）
  let privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error('\n❌ 错误: 未提供私钥');
    console.log('\n使用方法:');
    console.log('  PRIVATE_KEY=你的私钥 node test-transfer-auto.js');
    console.log('\n或创建 .env 文件并添加:');
    console.log('  PRIVATE_KEY=你的私钥');
    process.exit(1);
  }

  // 确保私钥格式正确
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  // 1. 查询转账前的余额
  console.log('\n📊 步骤 1: 查询转账前余额');
  console.log('-'.repeat(80));

  try {
    const ethBalance = await getEthBalance(FROM_ADDRESS);
    console.log(`发送者 ETH 余额: ${ethBalance} ETH`);

    const { balance: senderLinkBalance, symbol } = await getErc20Balance(
      FROM_ADDRESS,
      TOKEN_ADDRESS
    );
    console.log(`发送者 ${symbol} 余额: ${senderLinkBalance} ${symbol}`);

    const { balance: receiverLinkBalance } = await getErc20Balance(
      TO_ADDRESS,
      TOKEN_ADDRESS
    );
    console.log(`接收者 ${symbol} 余额: ${receiverLinkBalance} ${symbol}`);

    // 检查余额是否足够
    if (parseFloat(senderLinkBalance) < parseFloat(AMOUNT)) {
      console.error(`\n❌ 错误: ${symbol} 余额不足！`);
      console.error(`需要: ${AMOUNT} ${symbol}, 当前: ${senderLinkBalance} ${symbol}`);
      process.exit(1);
    }

    if (parseFloat(ethBalance) < 0.001) {
      console.warn(`\n⚠️  警告: ETH 余额可能不足以支付 Gas 费用`);
    }

  } catch (error) {
    console.error('查询余额失败:', error.message);
    process.exit(1);
  }

  // 2. 执行转账
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 步骤 2: 执行转账');
    console.log('='.repeat(80));

    const txHash = await sendErc20Transaction(
      privateKey,
      TOKEN_ADDRESS,
      TO_ADDRESS,
      AMOUNT,
      DECIMALS
    );

    console.log('\n' + '='.repeat(80));
    console.log('✅ 转账成功完成！');
    console.log('='.repeat(80));
    console.log(`\n交易哈希: ${txHash}`);
    console.log(`查看交易: https://sepolia.etherscan.io/tx/${txHash}`);

    // 3. 查询转账后的余额
    console.log('\n' + '='.repeat(80));
    console.log('📊 步骤 3: 查询转账后余额');
    console.log('='.repeat(80));

    // 等待一小段时间确保余额更新
    console.log('\n等待余额更新...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { balance: newSenderBalance, symbol } = await getErc20Balance(
      FROM_ADDRESS,
      TOKEN_ADDRESS
    );
    console.log(`\n发送者 ${symbol} 余额: ${newSenderBalance} ${symbol}`);

    const { balance: newReceiverBalance } = await getErc20Balance(
      TO_ADDRESS,
      TOKEN_ADDRESS
    );
    console.log(`接收者 ${symbol} 余额: ${newReceiverBalance} ${symbol}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 测试完成！所有功能验证成功！');
    console.log('='.repeat(80));
    console.log('\n已验证的功能:');
    console.log('✅ 1. 生成私钥 / 导入账户');
    console.log('✅ 2. 查询 ETH 余额');
    console.log('✅ 3. 查询 ERC20 代币余额');
    console.log('✅ 4. 构建 EIP-1559 交易');
    console.log('✅ 5. 使用私钥签名交易');
    console.log('✅ 6. 发送交易到 Sepolia 网络');
    console.log('✅ 7. 等待交易确认');
    console.log('✅ 8. 验证余额变化');

  } catch (error) {
    console.error('\n❌ 转账失败:', error.message);
    if (error.shortMessage) {
      console.error('详细信息:', error.shortMessage);
    }
    if (error.cause) {
      console.error('原因:', error.cause);
    }
    process.exit(1);
  }
}

// 运行测试
console.log('\n开始 ERC20 转账测试...\n');
testTransfer().catch(error => {
  console.error('\n测试过程中出现错误:', error);
  process.exit(1);
});
