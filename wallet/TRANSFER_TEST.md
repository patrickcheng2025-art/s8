# 转账测试指南

## 测试目标

转账 **2 LINK** 代币到地址 `0x85C08B7c558bC7c261F2Da8Db025e6c16a2c9751`

## 转账信息

```
从地址:     0x2Fc576C172034b9A40Dda17Eb313539FF60D9194
到地址:     0x85C08B7c558bC7c261F2Da8Db025e6c16a2c9751
代币合约:   0x779877A7B0D9E8603169DdbD7836e478b4624789 (LINK)
转账金额:   2 LINK
小数位数:   18
网络:       Sepolia 测试网
交易类型:   EIP-1559
```

## 当前余额状态

根据最新查询结果：

- **发送者 ETH 余额**: 2 ETH ✅ (足够支付 Gas)
- **发送者 LINK 余额**: 25 LINK ✅ (足够转账 2 LINK)
- **接收者 LINK 余额**: 0 LINK

## 执行测试

### 方法 1: 使用测试脚本（推荐）

```bash
cd wallet
npm run test-transfer
```

或者：

```bash
cd wallet
node test-transfer.js
```

### 方法 2: 使用完整钱包程序

```bash
cd wallet
npm start

# 然后按照菜单操作:
# 1. 选择 "2" - 导入钱包
# 2. 输入私钥
# 3. 选择 "5" - 发送 ERC20 代币
# 4. 输入以下信息:
#    - 代币合约地址: 0x779877A7B0D9E8603169DdbD7836e478b4624789
#    - 接收地址: 0x85C08B7c558bC7c261F2Da8Db025e6c16a2c9751
#    - 转账金额: 2
#    - 小数位数: 18
```

## 测试流程

测试脚本会自动执行以下步骤：

### 📊 步骤 1: 查询转账前余额
- 查询发送者 ETH 余额
- 查询发送者 LINK 余额
- 查询接收者 LINK 余额
- 验证余额是否足够

### 🚀 步骤 2: 执行转账
- **创建账户** - 从私钥创建账户对象
- **获取 Gas 参数** - 查询当前网络的 Base Fee
- **设置 EIP-1559 参数**:
  - Base Fee: 由网络决定
  - Max Priority Fee: 2 gwei (矿工小费)
  - Max Fee: Base Fee × 2 + 小费
- **构建交易** - 创建 ERC20 transfer 交易
- **模拟执行** - 验证交易可行性
- **签名交易** - 使用私钥对交易签名
- **广播交易** - 发送到 Sepolia 网络
- **等待确认** - 监听交易确认

### ✅ 步骤 3: 验证结果
- 查询发送者新余额（应该减少 2 LINK）
- 查询接收者新余额（应该增加 2 LINK）
- 显示交易哈希和区块浏览器链接

## 预期结果

### 转账前
```
发送者 LINK 余额: 25 LINK
接收者 LINK 余额: 0 LINK
```

### 转账后
```
发送者 LINK 余额: 23 LINK  (减少 2 LINK)
接收者 LINK 余额: 2 LINK   (增加 2 LINK)
```

### 交易信息
- 交易哈希: 0x...
- 区块号: #...
- Gas 使用量: ~65000 (约 0.00x ETH)
- 交易状态: 成功 ✅

## 验证的功能

执行这个测试将验证以下所有核心功能：

✅ **1. 私钥管理**
   - 从私钥创建账户
   - 安全处理私钥

✅ **2. 余额查询**
   - 查询 ETH 余额
   - 查询 ERC20 代币余额
   - 解析代币信息（符号、小数位数）

✅ **3. EIP-1559 交易构建**
   - 获取网络 Base Fee
   - 计算 Max Fee 和 Max Priority Fee
   - 构建符合 EIP-1559 标准的交易

✅ **4. 交易签名**
   - 使用私钥对交易进行签名
   - 生成有效的签名数据

✅ **5. 交易广播**
   - 将签名后的交易发送到网络
   - 获取交易哈希

✅ **6. 交易确认**
   - 等待交易被打包
   - 获取交易回执
   - 验证交易状态

✅ **7. 合约交互**
   - 调用 ERC20 合约的 transfer 函数
   - 正确编码函数参数
   - 处理合约返回值

✅ **8. 余额验证**
   - 确认转账后余额变化正确
   - 验证交易执行结果

## 查看交易

交易完成后，你可以在 Etherscan 上查看详细信息：

```
https://sepolia.etherscan.io/tx/[交易哈希]
```

也可以查看地址的交易历史：

- 发送者: https://sepolia.etherscan.io/address/0x2Fc576C172034b9A40Dda17Eb313539FF60D9194
- 接收者: https://sepolia.etherscan.io/address/0x85C08B7c558bC7c261F2Da8Db025e6c16a2c9751

## 故障排除

### 问题 1: "insufficient funds for gas"
**原因**: ETH 余额不足以支付 Gas 费用
**解决**: 从水龙头获取更多测试 ETH

### 问题 2: "transfer amount exceeds balance"
**原因**: LINK 代币余额不足
**解决**: 确认 LINK 余额是否 ≥ 2

### 问题 3: "nonce too low"
**原因**: 交易 nonce 冲突
**解决**: 等待之前的交易确认后重试

### 问题 4: "transaction underpriced"
**原因**: Gas 价格设置过低
**解决**: 脚本会自动设置合适的 Gas 价格，一般不会出现

### 问题 5: "execution reverted"
**原因**: 合约执行失败
**解决**: 检查代币合约地址是否正确

## 安全提醒

⚠️ **重要**:
- 私钥输入后不会显示在屏幕上
- 测试脚本不会保存你的私钥
- 这是测试网交易，没有实际价值
- 仍需妥善保管私钥

## 下一步

测试成功后，你可以：

1. 尝试转账其他金额
2. 测试转账给不同的地址
3. 尝试其他 ERC20 代币
4. 查看交易历史记录
5. 分析 Gas 费用消耗

## 相关文件

- 交互式测试脚本: [test-transfer.js](test-transfer.js)
- 自动化测试脚本: [test-transfer-auto.js](test-transfer-auto.js)
- 核心功能模块: [walletFunctions.js](walletFunctions.js)
- 完整文档: [README.md](README.md)
