// 使用提供的私钥进行测试
const {
  sendErc20Transaction,
  getErc20Balance,
  getEthBalance,
  createAccountFromPrivateKey
} = require('./walletFunctions');

// 转账参数
const PRIVATE_KEY = '0xde440424f82999f4fa6e9009fef19041537f4e55640e7b271fb4bfa293065676';
const TO_ADDRESS = '0x85C08B7c558bC7c261F2Da8Db025e6c16a2c9751';
const TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789'; // LINK
const AMOUNT = '2';
const DECIMALS = 18;

async function runTest() {
  console.log('='.repeat(80));
  console.log('ERC20 转账测试 - 使用提供的私钥');
  console.log('='.repeat(80));

  // 1. 验证私钥和地址
  console.log('\n📋 步骤 1: 验证私钥');
  console.log('-'.repeat(80));

  const account = createAccountFromPrivateKey(PRIVATE_KEY);
  console.log(`私钥: ${PRIVATE_KEY}`);
  console.log(`对应地址: ${account.address}`);

  const expectedAddress = '0x2Fc576C172034b9A40Dda17Eb313539FF60D9194';
  if (account.address.toLowerCase() === expectedAddress.toLowerCase()) {
    console.log('✅ 地址匹配！');
  } else {
    console.log(`❌ 地址不匹配！预期: ${expectedAddress}`);
    console.log('\n这就是问题所在！私钥对应的地址不是有余额的那个地址。');
    console.log(`实际地址 ${account.address} 可能没有足够的 ETH。`);
  }

  // 2. 查询实际地址的余额
  console.log('\n📊 步骤 2: 查询私钥对应地址的余额');
  console.log('-'.repeat(80));

  try {
    const ethBalance = await getEthBalance(account.address);
    console.log(`ETH 余额: ${ethBalance} ETH`);

    const { balance: linkBalance, symbol } = await getErc20Balance(
      account.address,
      TOKEN_ADDRESS
    );
    console.log(`${symbol} 余额: ${linkBalance} ${symbol}`);

    // 检查余额是否足够
    console.log('\n余额检查:');
    if (parseFloat(ethBalance) < 0.001) {
      console.log(`❌ ETH 余额不足以支付 Gas 费用（当前: ${ethBalance} ETH）`);
      console.log('需要从水龙头获取测试 ETH: https://sepoliafaucet.com/');
      process.exit(1);
    } else {
      console.log(`✅ ETH 余额足够（${ethBalance} ETH）`);
    }

    if (parseFloat(linkBalance) < parseFloat(AMOUNT)) {
      console.log(`❌ LINK 余额不足（需要: ${AMOUNT}, 当前: ${linkBalance}）`);
      process.exit(1);
    } else {
      console.log(`✅ LINK 余额足够（${linkBalance} LINK）`);
    }

  } catch (error) {
    console.error('查询余额失败:', error.message);
    process.exit(1);
  }

  // 3. 查询接收地址余额（转账前）
  console.log('\n📊 查询接收地址余额（转账前）');
  console.log('-'.repeat(80));

  try {
    const { balance: receiverBalance, symbol } = await getErc20Balance(
      TO_ADDRESS,
      TOKEN_ADDRESS
    );
    console.log(`接收地址 ${symbol} 余额: ${receiverBalance} ${symbol}`);
  } catch (error) {
    console.error('查询接收地址余额失败:', error.message);
  }

  // 4. 执行转账
  console.log('\n🚀 步骤 3: 执行转账');
  console.log('-'.repeat(80));
  console.log(`从: ${account.address}`);
  console.log(`到: ${TO_ADDRESS}`);
  console.log(`金额: ${AMOUNT} LINK`);

  try {
    const txHash = await sendErc20Transaction(
      PRIVATE_KEY,
      TOKEN_ADDRESS,
      TO_ADDRESS,
      AMOUNT,
      DECIMALS
    );

    console.log('\n' + '='.repeat(80));
    console.log('✅ 转账成功！');
    console.log('='.repeat(80));
    console.log(`\n交易哈希: ${txHash}`);
    console.log(`Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);

    // 5. 查询转账后余额
    console.log('\n📊 步骤 4: 查询转账后余额');
    console.log('-'.repeat(80));

    await new Promise(resolve => setTimeout(resolve, 3000));

    const { balance: newSenderBalance, symbol } = await getErc20Balance(
      account.address,
      TOKEN_ADDRESS
    );
    console.log(`发送者 ${symbol} 余额: ${newSenderBalance} ${symbol}`);

    const { balance: newReceiverBalance } = await getErc20Balance(
      TO_ADDRESS,
      TOKEN_ADDRESS
    );
    console.log(`接收者 ${symbol} 余额: ${newReceiverBalance} ${symbol}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 测试完成！');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ 转账失败:', error.message);
    if (error.shortMessage) {
      console.error('简要说明:', error.shortMessage);
    }
    if (error.details) {
      console.error('详细信息:', error.details);
    }
  }
}

console.log('\n开始测试...\n');
runTest().catch(console.error);
