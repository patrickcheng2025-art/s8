# ERC20 带回调功能的转账合约

## 项目概述

本项目实现了一个扩展的 ERC20 代币合约,添加了 `transferWithCallback` 函数,支持在转账到合约地址时自动调用目标合约的回调函数。

## 合约文件说明

### 1. IERC20Receiver.sol
定义了接收代币转账的接口。任何希望通过 `transferWithCallback` 接收代币的合约都必须实现此接口。

**接口方法:**
```solidity
function tokensReceived(
    address operator,  // 发起转账的地址
    address from,      // 代币发送方地址
    uint256 amount,    // 转账数量
    bytes calldata data // 附加数据
) external returns (bytes4);
```

### 2. ERC20WithCallback.sol
扩展的 ERC20 代币合约,实现了标准 ERC20 功能和带回调的转账功能。

**主要功能:**
- 标准 ERC20 函数: `transfer`, `transferFrom`, `approve`
- 扩展函数: `transferWithCallback` - 带回调的转账函数

**transferWithCallback 工作流程:**
1. 验证转账参数(接收地址非零,余额充足)
2. 执行代币转账
3. 检查接收地址是否为合约地址
4. 如果是合约,调用其 `tokensReceived` 回调函数
5. 验证回调函数返回值,确保接收方正确实现了接口

### 3. TokenReceiver.sol
包含两个示例合约:

**TokenReceiver (正确实现)**
- 实现了 `IERC20Receiver` 接口
- 记录所有接收到的代币转账信息
- 提供查询历史记录的功能

**BadTokenReceiver (错误示例)**
- 未实现 `IERC20Receiver` 接口
- 用于演示当接收方未正确实现接口时的失败情况

## 使用示例

### 部署合约
```solidity
// 1. 部署 ERC20 代币合约
ERC20WithCallback token = new ERC20WithCallback(
    "MyToken",           // 代币名称
    "MTK",              // 代币符号
    18,                 // 小数位数
    1000000 * 10**18    // 总供应量
);

// 2. 部署接收合约
TokenReceiver receiver = new TokenReceiver();
```

### 使用 transferWithCallback
```solidity
// 向合约地址转账,会自动调用回调函数
bytes memory data = abi.encode("Hello from token transfer");
token.transferWithCallback(
    address(receiver),  // 接收方(合约地址)
    1000 * 10**18,     // 转账数量
    data               // 附加数据
);

// 查询接收记录
uint256 count = receiver.getReceivedCount();
(address operator, address from, uint256 amount, bytes memory receivedData, uint256 timestamp)
    = receiver.getReceivedToken(0);
```

### 向普通地址转账
```solidity
// 如果接收地址不是合约,则只执行普通转账,不会调用回调
token.transferWithCallback(
    0x1234567890123456789012345678901234567890,  // 普通地址
    1000 * 10**18,
    ""
);
```

## 关键特性

### 1. 安全检查
- 转账前验证余额充足
- 禁止向零地址转账
- 验证回调函数返回值,防止转账到不支持接收的合约

### 2. 合约地址检测
使用 `extcodesize` 操作码检测地址是否为合约:
```solidity
function isContract(address account) internal view returns (bool) {
    uint256 size;
    assembly {
        size := extcodesize(account)
    }
    return size > 0;
}
```

### 3. 事件记录
- `Transfer`: 标准转账事件
- `TransferWithCallback`: 带回调转账的特殊事件,包含附加数据

## 注意事项

1. **Gas 消耗**: `transferWithCallback` 比普通 `transfer` 消耗更多 gas,因为需要额外的合约调用
2. **重入攻击**: 回调函数可能导致重入攻击,建议接收合约谨慎处理
3. **接口实现**: 接收合约必须正确实现 `IERC20Receiver` 接口,否则转账会失败
4. **构造函数调用**: 注意在合约构造函数中,`extcodesize` 返回 0,因此构造函数中的转账不会触发回调

## 应用场景

1. **自动化处理**: 合约接收代币后自动执行特定逻辑
2. **支付通知**: 接收方在收到代币时立即得到通知
3. **原子操作**: 将转账和后续操作组合成原子操作
4. **智能钱包**: 实现更复杂的代币接收逻辑

## 与其他标准的对比

这个实现类似于:
- **ERC721**: `safeTransferFrom` + `onERC721Received`
- **ERC1155**: `safeTransferFrom` + `onERC1155Received`
- **ERC777**: 更完整的 hooks 系统(包括发送和接收的 hook)

本实现提供了一个轻量级的解决方案,在保持与 ERC20 兼容的同时,添加了必要的回调功能。
