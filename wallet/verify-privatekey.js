// 验证私钥对应的地址
const readline = require('readline');
const { privateKeyToAccount } = require('viem/accounts');
const { getEthBalance } = require('./walletFunctions');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function verifyPrivateKey() {
  console.log('='.repeat(80));
  console.log('验证私钥和地址');
  console.log('='.repeat(80));

  rl.question('\n请输入私钥: ', async (privateKey) => {
    try {
      // 确保私钥格式正确
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }

      // 从私钥生成地址
      const account = privateKeyToAccount(privateKey);

      console.log('\n私钥信息:');
      console.log('-'.repeat(80));
      console.log(`私钥: ${privateKey}`);
      console.log(`对应地址: ${account.address}`);

      // 查询这个地址的余额
      console.log('\n查询余额...');
      const ethBalance = await getEthBalance(account.address);
      console.log(`ETH 余额: ${ethBalance} ETH`);

      // 与预期地址比较
      const expectedAddress = '0x2Fc576C172034b9A40Dda17Eb313539FF60D9194';
      console.log('\n地址验证:');
      console.log('-'.repeat(80));
      console.log(`预期地址: ${expectedAddress}`);
      console.log(`实际地址: ${account.address}`);

      if (account.address.toLowerCase() === expectedAddress.toLowerCase()) {
        console.log('✅ 地址匹配！私钥正确');
      } else {
        console.log('❌ 地址不匹配！私钥错误');
        console.log('\n⚠️  这可能是导致 "exceeds the balance" 错误的原因！');
        console.log('私钥对应的地址没有足够的 ETH，而不是预期的地址');
      }

      console.log('\n' + '='.repeat(80));

    } catch (error) {
      console.error('\n验证失败:', error.message);
    }

    rl.close();
  });
}

console.log('\n这个工具会帮你验证私钥是否对应正确的地址\n');
verifyPrivateKey();
