// 检查当前Gas价格
const { createPublicClient, http, formatEther, formatGwei } = require('viem');
const { sepolia } = require('viem/chains');

const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

async function checkGas() {
  console.log('='.repeat(80));
  console.log('检查当前 Sepolia Gas 价格');
  console.log('='.repeat(80));

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL)
  });

  try {
    // 获取最新区块
    const block = await publicClient.getBlock({ blockTag: 'latest' });
    const baseFeePerGas = block.baseFeePerGas;

    console.log('\n当前网络 Gas 信息:');
    console.log('-'.repeat(80));
    console.log(`Base Fee Per Gas: ${baseFeePerGas.toString()} Wei`);
    console.log(`Base Fee Per Gas: ${formatGwei(baseFeePerGas)} Gwei`);
    console.log(`Base Fee Per Gas: ${formatEther(baseFeePerGas)} ETH`);

    // 计算推荐的 Gas 参数
    const maxPriorityFeePerGas = BigInt(2000000000); // 2 gwei
    console.log(`\nMax Priority Fee (小费): ${formatGwei(maxPriorityFeePerGas)} Gwei`);

    // 原来的算法: baseFee * 2 + 小费
    const maxFeePerGasOld = baseFeePerGas * BigInt(2) + maxPriorityFeePerGas;
    console.log(`\n原 Max Fee (baseFee * 2 + 小费): ${formatGwei(maxFeePerGasOld)} Gwei`);
    console.log(`原 Max Fee: ${formatEther(maxFeePerGasOld)} ETH`);

    // 新算法: baseFee * 1.2 + 小费（更合理）
    const maxFeePerGasNew = (baseFeePerGas * BigInt(120)) / BigInt(100) + maxPriorityFeePerGas;
    console.log(`\n新 Max Fee (baseFee * 1.2 + 小费): ${formatGwei(maxFeePerGasNew)} Gwei`);
    console.log(`新 Max Fee: ${formatEther(maxFeePerGasNew)} ETH`);

    // 估算 ERC20 transfer 的 Gas 消耗
    const estimatedGasUsed = BigInt(65000); // ERC20 transfer 通常消耗 ~65000 gas

    console.log('\n估算交易成本 (假设使用 65000 gas):');
    console.log('-'.repeat(80));

    const costOld = maxFeePerGasOld * estimatedGasUsed;
    console.log(`使用原 Max Fee: ${formatEther(costOld)} ETH`);

    const costNew = maxFeePerGasNew * estimatedGasUsed;
    console.log(`使用新 Max Fee: ${formatEther(costNew)} ETH`);

    // 与账户余额比较
    const accountBalance = BigInt('2000000000000000000'); // 2 ETH
    console.log(`\n账户 ETH 余额: ${formatEther(accountBalance)} ETH`);

    if (costOld > accountBalance) {
      console.log('❌ 使用原 Max Fee 会超出余额！');
    } else {
      console.log('✅ 使用原 Max Fee 余额足够');
    }

    if (costNew > accountBalance) {
      console.log('❌ 使用新 Max Fee 会超出余额！');
    } else {
      console.log('✅ 使用新 Max Fee 余额足够');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

checkGas().catch(console.error);
