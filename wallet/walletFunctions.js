// 钱包核心功能模块
const {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  formatEther,
  parseUnits,
  formatUnits
} = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { sepolia } = require('viem/chains');
const { generatePrivateKey } = require('viem/accounts');
const erc20Abi = require('./erc20Abi');

// Sepolia 网络的公共 RPC 端点
// 使用 Cloudflare 的公共端点，更稳定
const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
// 备用端点: 'https://rpc.sepolia.org' 或 'https://rpc2.sepolia.org'

/**
 * 生成新的私钥
 * @returns {string} 生成的私钥（十六进制格式）
 */
function generateNewPrivateKey() {
  const privateKey = generatePrivateKey();
  return privateKey;
}

/**
 * 从私钥创建账户对象
 * @param {string} privateKey - 私钥（十六进制格式）
 * @returns {Object} 账户对象，包含地址和签名功能
 */
function createAccountFromPrivateKey(privateKey) {
  return privateKeyToAccount(privateKey);
}

/**
 * 获取账户的 ETH 余额
 * @param {string} address - 账户地址
 * @returns {Promise<string>} ETH 余额（格式化后的字符串）
 */
async function getEthBalance(address) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL)
  });

  const balance = await publicClient.getBalance({
    address: address
  });

  return formatEther(balance);
}

/**
 * 获取账户的 ERC20 代币余额
 * @param {string} address - 账户地址
 * @param {string} tokenAddress - ERC20 代币合约地址
 * @returns {Promise<Object>} 包含余额、代币符号和小数位数的对象
 */
async function getErc20Balance(address, tokenAddress) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL)
  });

  // 获取代币余额
  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address]
  });

  // 获取代币小数位数
  const decimals = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals'
  });

  // 获取代币符号
  const symbol = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'symbol'
  });

  return {
    balance: formatUnits(balance, decimals),
    symbol,
    decimals
  };
}

/**
 * 构建、签名并发送 ERC20 转账交易（使用 EIP-1559）
 * @param {string} privateKey - 发送者私钥
 * @param {string} tokenAddress - ERC20 代币合约地址
 * @param {string} toAddress - 接收者地址
 * @param {string} amount - 转账金额（人类可读格式）
 * @param {number} decimals - 代币小数位数
 * @returns {Promise<string>} 交易哈希
 */
async function sendErc20Transaction(privateKey, tokenAddress, toAddress, amount, decimals = 18) {
  // 1. 从私钥创建账户
  const account = createAccountFromPrivateKey(privateKey);

  // 2. 创建公共客户端（用于获取链上数据）
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL)
  });

  // 3. 创建钱包客户端（用于发送交易）
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL)
  });

  // 4. 获取当前的 gas 价格信息（用于 EIP-1559）
  const block = await publicClient.getBlock({ blockTag: 'latest' });
  const baseFeePerGas = block.baseFeePerGas;

  // maxPriorityFeePerGas: 给矿工的小费，设置为 1.5 gwei
  const maxPriorityFeePerGas = parseEther('0.0000000015'); // 1.5 gwei

  // maxFeePerGas: 最大愿意支付的 gas 费用
  // 设置为 baseFee * 1.3 + 小费，避免过高的 Gas 费用
  const maxFeePerGas = (baseFeePerGas * BigInt(130)) / BigInt(100) + maxPriorityFeePerGas;

  console.log('\n交易 Gas 参数 (EIP-1559):');
  console.log(`- Base Fee: ${formatEther(baseFeePerGas)} ETH`);
  console.log(`- Max Priority Fee (小费): ${formatEther(maxPriorityFeePerGas)} ETH`);
  console.log(`- Max Fee: ${formatEther(maxFeePerGas)} ETH`);

  // 5. 将转账金额转换为最小单位
  const amountInWei = parseUnits(amount, decimals);

  // 6. 构建交易请求（模拟执行，获取 gas 估算）
  // 设置合理的 gas limit，避免使用默认的过大值
  const gasLimit = BigInt(100000); // ERC20 transfer 通常只需要 ~65000 gas

  const request = await publicClient.simulateContract({
    account,
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [toAddress, amountInWei],
    maxFeePerGas,
    maxPriorityFeePerGas,
    gas: gasLimit
  });

  console.log('\n✓ 交易模拟成功，准备发送...');

  // 7. 发送交易（walletClient 会自动使用私钥签名）
  const hash = await walletClient.writeContract(request.request);

  console.log(`\n✓ 交易已发送！`);
  console.log(`交易哈希: ${hash}`);
  console.log(`查看交易: https://sepolia.etherscan.io/tx/${hash}`);

  // 8. 等待交易确认
  console.log('\n等待交易确认...');
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1
  });

  console.log(`\n✓ 交易已确认！`);
  console.log(`区块号: ${receipt.blockNumber}`);
  console.log(`Gas 使用量: ${receipt.gasUsed.toString()}`);
  console.log(`交易状态: ${receipt.status === 'success' ? '成功' : '失败'}`);

  return hash;
}

/**
 * 获取账户的交易计数（nonce）
 * @param {string} address - 账户地址
 * @returns {Promise<number>} 交易计数
 */
async function getTransactionCount(address) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL)
  });

  return await publicClient.getTransactionCount({
    address: address
  });
}

module.exports = {
  generateNewPrivateKey,
  createAccountFromPrivateKey,
  getEthBalance,
  getErc20Balance,
  sendErc20Transaction,
  getTransactionCount
};
