// 测试脚本 - 查询指定地址的余额
const {
  getEthBalance,
  getErc20Balance
} = require('./walletFunctions');

// 要查询的钱包地址
const ADDRESS = '0x2Fc576C172034b9A40Dda17Eb313539FF60D9194';

// Sepolia 测试网上的常见 ERC20 代币地址
const TOKENS = {
  LINK: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
  // 你可以添加更多代币地址
};

async function testBalance() {
  console.log('='.repeat(80));
  console.log('钱包余额查询测试');
  console.log('='.repeat(80));
  console.log(`\n查询地址: ${ADDRESS}`);
  console.log(`网络: Sepolia 测试网\n`);

  // 1. 查询 ETH 余额
  console.log('-'.repeat(80));
  console.log('1. 查询 ETH 余额');
  console.log('-'.repeat(80));
  try {
    const ethBalance = await getEthBalance(ADDRESS);
    console.log(`✓ ETH 余额: ${ethBalance} ETH`);

    // 转换为 Wei 以显示更精确的值
    const ethInWei = BigInt(parseFloat(ethBalance) * 1e18);
    console.log(`  (精确值: ${ethInWei.toString()} Wei)`);
  } catch (error) {
    console.error('✗ 查询 ETH 余额失败:', error.message);
  }

  // 2. 查询 LINK 代币余额
  console.log('\n' + '-'.repeat(80));
  console.log('2. 查询 LINK 代币余额');
  console.log('-'.repeat(80));
  try {
    const { balance, symbol, decimals } = await getErc20Balance(
      ADDRESS,
      TOKENS.LINK
    );
    console.log(`✓ ${symbol} 余额: ${balance} ${symbol}`);
    console.log(`  代币合约: ${TOKENS.LINK}`);
    console.log(`  小数位数: ${decimals}`);
  } catch (error) {
    console.error('✗ 查询 LINK 余额失败:', error.message);
  }

  // 3. 在 Etherscan 上查看地址
  console.log('\n' + '-'.repeat(80));
  console.log('3. 在区块浏览器上查看');
  console.log('-'.repeat(80));
  console.log(`Etherscan 链接: https://sepolia.etherscan.io/address/${ADDRESS}`);

  console.log('\n' + '='.repeat(80));
  console.log('测试完成！');
  console.log('='.repeat(80));
}

// 运行测试
console.log('\n开始测试...\n');
testBalance().catch(error => {
  console.error('\n测试过程中出现错误:', error);
  process.exit(1);
});
