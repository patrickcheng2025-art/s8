#!/usr/bin/env node
// 命令行钱包主程序
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const {
  generateNewPrivateKey,
  createAccountFromPrivateKey,
  getEthBalance,
  getErc20Balance,
  sendErc20Transaction,
  getTransactionCount
} = require('./walletFunctions');

// 钱包数据存储文件
const WALLET_FILE = path.join(__dirname, '.wallet.json');

// 创建命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 钱包数据
let walletData = {
  privateKey: null,
  address: null
};

/**
 * 加载已保存的钱包数据
 */
function loadWallet() {
  try {
    if (fs.existsSync(WALLET_FILE)) {
      const data = fs.readFileSync(WALLET_FILE, 'utf8');
      walletData = JSON.parse(data);
      console.log('\n✓ 已加载现有钱包');
      console.log(`地址: ${walletData.address}`);
      return true;
    }
  } catch (error) {
    console.error('加载钱包失败:', error.message);
  }
  return false;
}

/**
 * 保存钱包数据到文件
 */
function saveWallet() {
  try {
    fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData, null, 2));
    console.log('✓ 钱包已保存');
  } catch (error) {
    console.error('保存钱包失败:', error.message);
  }
}

/**
 * 生成新钱包
 */
async function generateWallet() {
  try {
    console.log('\n正在生成新钱包...');

    const privateKey = generateNewPrivateKey();
    const account = createAccountFromPrivateKey(privateKey);

    walletData.privateKey = privateKey;
    walletData.address = account.address;

    console.log('\n✓ 新钱包已生成！');
    console.log('='.repeat(80));
    console.log(`私钥: ${privateKey}`);
    console.log(`地址: ${account.address}`);
    console.log('='.repeat(80));
    console.log('\n⚠️  警告: 请妥善保管私钥，不要泄露给他人！');

    saveWallet();
  } catch (error) {
    console.error('生成钱包失败:', error.message);
  }
}

/**
 * 导入已有钱包
 */
async function importWallet() {
  rl.question('\n请输入私钥: ', async (privateKey) => {
    try {
      // 确保私钥格式正确（以 0x 开头）
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }

      const account = createAccountFromPrivateKey(privateKey);

      walletData.privateKey = privateKey;
      walletData.address = account.address;

      console.log('\n✓ 钱包导入成功！');
      console.log(`地址: ${account.address}`);

      saveWallet();
    } catch (error) {
      console.error('导入钱包失败:', error.message);
    }

    showMenu();
  });
}

/**
 * 查询余额
 */
async function checkBalance() {
  if (!walletData.address) {
    console.log('\n⚠️  请先生成或导入钱包！');
    showMenu();
    return;
  }

  rl.question('\n查询类型 (1: ETH, 2: ERC20): ', async (choice) => {
    try {
      if (choice === '1') {
        console.log('\n正在查询 ETH 余额...');
        const balance = await getEthBalance(walletData.address);
        console.log(`\n✓ ETH 余额: ${balance} ETH`);
        console.log(`地址: ${walletData.address}`);
      } else if (choice === '2') {
        rl.question('请输入 ERC20 代币合约地址: ', async (tokenAddress) => {
          console.log('\n正在查询代币余额...');
          const { balance, symbol, decimals } = await getErc20Balance(
            walletData.address,
            tokenAddress
          );
          console.log(`\n✓ ${symbol} 余额: ${balance} ${symbol}`);
          console.log(`代币合约: ${tokenAddress}`);
          console.log(`小数位数: ${decimals}`);
          console.log(`持有地址: ${walletData.address}`);
          showMenu();
        });
        return;
      } else {
        console.log('无效选择');
      }
    } catch (error) {
      console.error('查询余额失败:', error.message);
    }

    showMenu();
  });
}

/**
 * 发送 ERC20 代币
 */
async function sendErc20() {
  if (!walletData.privateKey) {
    console.log('\n⚠️  请先生成或导入钱包！');
    showMenu();
    return;
  }

  rl.question('\n请输入 ERC20 代币合约地址: ', (tokenAddress) => {
    rl.question('请输入接收地址: ', (toAddress) => {
      rl.question('请输入转账金额: ', (amount) => {
        rl.question('请输入代币小数位数 (默认 18): ', async (decimalsInput) => {
          try {
            const decimals = decimalsInput ? parseInt(decimalsInput) : 18;

            console.log('\n准备发送交易...');
            console.log(`从: ${walletData.address}`);
            console.log(`到: ${toAddress}`);
            console.log(`金额: ${amount}`);
            console.log(`代币合约: ${tokenAddress}`);

            const hash = await sendErc20Transaction(
              walletData.privateKey,
              tokenAddress,
              toAddress,
              amount,
              decimals
            );

            console.log(`\n✓ 交易成功！交易哈希: ${hash}`);
          } catch (error) {
            console.error('\n✗ 交易失败:', error.message);
            if (error.shortMessage) {
              console.error('详细信息:', error.shortMessage);
            }
          }

          showMenu();
        });
      });
    });
  });
}

/**
 * 查看钱包信息
 */
async function viewWalletInfo() {
  if (!walletData.address) {
    console.log('\n⚠️  还未创建或导入钱包');
    showMenu();
    return;
  }

  console.log('\n当前钱包信息:');
  console.log('='.repeat(80));
  console.log(`地址: ${walletData.address}`);
  console.log(`私钥: ${walletData.privateKey}`);

  try {
    const nonce = await getTransactionCount(walletData.address);
    console.log(`交易计数 (Nonce): ${nonce}`);
  } catch (error) {
    console.error('获取交易计数失败:', error.message);
  }

  console.log('='.repeat(80));
  showMenu();
}

/**
 * 显示主菜单
 */
function showMenu() {
  console.log('\n' + '='.repeat(80));
  console.log('命令行钱包 - 基于 Viem.js & Sepolia 测试网');
  console.log('='.repeat(80));
  console.log('1. 生成新钱包');
  console.log('2. 导入钱包');
  console.log('3. 查看钱包信息');
  console.log('4. 查询余额');
  console.log('5. 发送 ERC20 代币 (EIP-1559)');
  console.log('6. 退出');
  console.log('='.repeat(80));

  rl.question('\n请选择操作 (1-6): ', (choice) => {
    console.log('');

    switch (choice) {
      case '1':
        generateWallet().then(() => showMenu());
        break;
      case '2':
        importWallet();
        break;
      case '3':
        viewWalletInfo();
        break;
      case '4':
        checkBalance();
        break;
      case '5':
        sendErc20();
        break;
      case '6':
        console.log('再见！');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('无效选择，请重新输入');
        showMenu();
    }
  });
}

// 程序入口
console.log('\n欢迎使用命令行钱包！');
console.log('网络: Sepolia 测试网');
console.log('交易类型: EIP-1559\n');

// 尝试加载已有钱包
loadWallet();

// 显示主菜单
showMenu();
