# TokenBank 与 TokenBankV2 使用说明

## 项目概述

本项目实现了支持 ERC20 代币存取的银行合约系统,包括:
- **TokenBank**: 基础代币银行合约,支持传统的 approve + deposit 存款方式
- **TokenBankV2**: 增强版代币银行,支持通过 `transferWithCallback` 直接存款

## 合约文件说明

### 1. TokenBank.sol
基础的 ERC20 代币银行合约。

**核心功能:**
- ✅ 支持多种 ERC20 代币的存取
- ✅ 记录每个用户在不同代币的余额
- ✅ 维护每种代币的前3名存款者排行榜
- ✅ 提供查询余额和排行榜的接口

**主要函数:**
```solidity
// 存款(需要先 approve)
function deposit(address token, uint256 amount) public

// 取款
function withdraw(address token, uint256 amount) public

// 查询余额
function getBalance(address token, address user) public view returns (uint256)

// 查询排行榜
function getTopDepositors(address token) public view returns (address[3] memory, uint256[3] memory)
```

### 2. TokenBankV2.sol
继承自 TokenBank 的增强版合约,实现了 `IERC20Receiver` 接口。

**新增功能:**
- ✅ 实现 `tokensReceived` 回调函数
- ✅ 支持通过 `transferWithCallback` 直接存款,无需 approve
- ✅ 保留传统的 approve + deposit 存款方式
- ✅ 记录更详细的存款信息(包括 operator 和附加数据)

**关键实现:**
```solidity
function tokensReceived(
    address operator,  // 操作者地址
    address from,      // 代币发送方
    uint256 amount,    // 存款金额
    bytes calldata data // 附加数据
) external override returns (bytes4)
```

## 使用方式对比

### 方式一: 传统存款(TokenBank 和 TokenBankV2 都支持)

需要两步操作:

```solidity
// 步骤1: 用户授权 TokenBank 使用代币
token.approve(address(tokenBank), amount);

// 步骤2: 调用 deposit 函数存款
tokenBank.deposit(address(token), amount);
```

**优点:**
- 传统方式,广泛支持
- 用户可以精确控制授权额度

**缺点:**
- 需要两次交易
- Gas 费用较高
- 用户体验较差

### 方式二: 直接存款(仅 TokenBankV2 支持)

只需一步操作:

```solidity
// 一步完成:转账并自动存款
token.transferWithCallback(
    address(tokenBankV2),  // 银行合约地址
    amount,                // 存款金额
    ""                     // 附加数据(可选)
);
```

**工作流程:**
1. 用户调用 ERC20WithCallback 的 `transferWithCallback`
2. 代币合约执行转账,将代币转入 TokenBankV2
3. 代币合约检测到接收方是合约,调用其 `tokensReceived`
4. TokenBankV2 的 `tokensReceived` 自动记录存款信息
5. 更新用户余额和排行榜

**优点:**
- ✅ 只需一次交易
- ✅ 节省 Gas 费用
- ✅ 用户体验更好
- ✅ 可以传递附加数据

**缺点:**
- 需要代币合约支持 `transferWithCallback` 功能

## 完整使用示例

### 部署合约

```solidity
// 1. 部署 ERC20WithCallback 代币
ERC20WithCallback token = new ERC20WithCallback(
    "MyToken",
    "MTK",
    18,
    1000000 * 10**18
);

// 2. 部署 TokenBank (可选)
TokenBank bank = new TokenBank();

// 3. 部署 TokenBankV2
TokenBankV2 bankV2 = new TokenBankV2();
```

### 传统方式存款

```solidity
// 用户A 使用传统方式存款
address userA = 0x1234...;

// 步骤1: 授权
token.approve(address(bankV2), 1000 * 10**18);

// 步骤2: 存款
bankV2.deposit(address(token), 1000 * 10**18);

// 查询余额
uint256 balance = bankV2.getBalance(address(token), userA);
console.log("User A balance:", balance);
```

### 新方式存款(transferWithCallback)

```solidity
// 用户B 使用 transferWithCallback 直接存款
address userB = 0x5678...;

// 一步完成存款
bytes memory data = abi.encode("Deposit via callback");
token.transferWithCallback(
    address(bankV2),
    2000 * 10**18,
    data
);

// 查询余额
uint256 balance = bankV2.getBalance(address(token), userB);
console.log("User B balance:", balance);
```

### 取款

```solidity
// 用户取款(两种方式存入的都可以取出)
bankV2.withdraw(address(token), 500 * 10**18);
```

### 查询排行榜

```solidity
// 查询某个代币的前3名存款者
(address[3] memory topAddresses, uint256[3] memory topBalances) =
    bankV2.getTopDepositors(address(token));

for (uint i = 0; i < 3; i++) {
    console.log("Top", i+1, ":", topAddresses[i], "- Balance:", topBalances[i]);
}
```

## 事件说明

### TokenBank 事件
```solidity
// 存款事件
event Deposited(address indexed token, address indexed user, uint256 amount);

// 取款事件
event Withdrawn(address indexed token, address indexed user, uint256 amount);
```

### TokenBankV2 额外事件
```solidity
// 通过 callback 方式存款的特殊事件
event DepositedViaCallback(
    address indexed token,
    address indexed from,
    address indexed operator,
    uint256 amount,
    bytes data
);
```

## 安全特性

### 1. 重入保护
虽然当前实现没有显式的重入锁,但由于:
- 存款: 先执行外部调用(transferFrom),后更新状态
- 取款: 先更新状态(减少余额),后执行外部调用(transfer)

取款操作遵循了 Checks-Effects-Interactions 模式,天然防止重入攻击。

### 2. 地址验证
- 禁止使用零地址作为代币地址
- 检查金额必须大于0
- 检查余额是否足够

### 3. 权限控制
- owner 权限保留(可用于未来的管理功能)

## 排行榜更新逻辑

排行榜维护算法在 [TokenBank.sol:103-146](../d6/TokenBank.sol#L103-L146) 中实现:

1. **检查现有位置**: 先查找用户是否已在榜单中
2. **移除旧记录**: 如果在榜单中,先移除(向前移动后续元素)
3. **查找插入位置**: 根据新余额找到合适的插入位置
4. **插入新记录**: 将新记录插入,并向后移动后续元素

**注意事项:**
- 每次存款或取款都会更新排行榜
- 如果用户余额变为0,会从榜单中移除
- 使用固定大小数组(3个位置),节省 Gas

## 与 d5 项目的关系

本项目(d6)依赖于 d5 项目中的合约:
- `d5/IERC20Receiver.sol`: 定义回调接口
- `d5/ERC20WithCallback.sol`: 支持 callback 的 ERC20 代币

确保在使用 TokenBankV2 时,使用的是 ERC20WithCallback 代币,而不是标准的 ERC20 代币。

## Gas 优化建议

1. **批量操作**: 如果需要多次存取,考虑批量操作接口
2. **选择合适的存款方式**:
   - 单次存款使用 `transferWithCallback`
   - 多次存款考虑一次 approve 多次 deposit
3. **排行榜查询**: 使用 view 函数,不消耗 Gas

## 常见问题

### Q1: 为什么 transferWithCallback 存款失败?
A: 确保:
- 使用的是 ERC20WithCallback 代币,不是标准 ERC20
- 代币余额充足
- TokenBankV2 正确实现了 IERC20Receiver 接口

### Q2: 可以混用两种存款方式吗?
A: 可以!TokenBankV2 支持两种方式,最终都会记录到同一个余额账户中。

### Q3: 如何处理附加数据(data)?
A: 当前实现只是记录了 data,你可以扩展 TokenBankV2 来解析 data 并实现更多功能,例如:
```solidity
// 解析 data 实现不同的存款逻辑
if (data.length > 0) {
    // 例如: 锁定存款,定期存款等
    (uint256 lockPeriod) = abi.decode(data, (uint256));
    // 实现锁定逻辑...
}
```

### Q4: 排行榜什么时候更新?
A: 每次存款或取款时自动更新。

## 未来扩展建议

1. **锁定存款**: 利用 data 参数实现定期存款功能
2. **利息系统**: 为存款用户提供利息
3. **多签管理**: 增强 owner 权限的安全性
4. **批量操作**: 实现批量存取功能
5. **紧急暂停**: 添加紧急暂停机制
6. **手续费**: 对存取操作收取少量手续费

## 测试建议

1. 测试传统存款流程
2. 测试 callback 存款流程
3. 测试排行榜更新逻辑
4. 测试边界情况(余额为0、超大金额等)
5. 测试取款后排行榜的正确性
6. 测试多用户并发存款的排行榜
