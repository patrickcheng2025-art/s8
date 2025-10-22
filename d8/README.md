# ERC721 标准 NFT 智能合约实现

## 📋 项目概述

本项目实现了一个完整的 ERC721 标准 NFT 智能合约,严格遵循以太坊 ERC721 标准,确保安全性和兼容性。

## 📁 文件说明

### 1. erc721.sol (模板文件)
原始模板文件,包含基础框架,所有需要实现的代码位置都标记为 `/**code*/`。

### 2. erc721-all.sol (完整实现)
完整实现版本,只填写了 `/**code*/` 标记的位置,保持其他代码不变。

## ✅ 实现的功能

### 核心 ERC721 功能

1. **铸造 (Minting)**
   - `mint(address to, uint256 tokenId)` - 铸造新的 NFT

2. **查询功能**
   - `balanceOf(address owner)` - 查询地址拥有的 NFT 数量
   - `ownerOf(uint256 tokenId)` - 查询 NFT 的所有者
   - `name()` - 返回 NFT 集合名称
   - `symbol()` - 返回 NFT 符号
   - `tokenURI(uint256 tokenId)` - 返回 NFT 元数据 URI

3. **授权功能**
   - `approve(address to, uint256 tokenId)` - 授权地址管理指定 NFT
   - `getApproved(uint256 tokenId)` - 查询 NFT 的授权地址
   - `setApprovalForAll(address operator, bool approved)` - 授权/取消授权操作员管理所有 NFT
   - `isApprovedForAll(address owner, address operator)` - 查询操作员授权状态

4. **转账功能**
   - `transferFrom(address from, address to, uint256 tokenId)` - 转移 NFT
   - `safeTransferFrom(address from, address to, uint256 tokenId)` - 安全转移 NFT
   - `safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)` - 带数据的安全转移

5. **接口支持**
   - `supportsInterface(bytes4 interfaceId)` - ERC165 接口检测

## 🔍 代码实现详解

### 已实现的 `/**code*/` 位置

#### 1. 构造函数 (第 69-71 行)
```solidity
constructor(
    string memory name_,
    string memory symbol_,
    string memory baseURI_
) {
    /**code*/
    _name = name_;
    _symbol = symbol_;
    _baseURI = baseURI_;
}
```
**功能**: 初始化 NFT 集合的名称、符号和基础 URI。

#### 2. name() 函数 (第 87-89 行)
```solidity
function name() public view returns (string memory) {
    /**code*/
    return _name;
}
```
**功能**: 返回 NFT 集合名称。

#### 3. symbol() 函数 (第 95-97 行)
```solidity
function symbol() public view returns (string memory) {
    /**code*/
    return _symbol;
}
```
**功能**: 返回 NFT 符号。

#### 4. tokenURI() 函数 (第 104-110 行)
```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    require(
        /**code*/
        _exists(tokenId),
        "ERC721Metadata: URI query for nonexistent token"
    );

    // should return baseURI
    /**code*/
    return string(abi.encodePacked(_baseURI, tokenId.toString()));
}
```
**功能**: 返回拼接后的 tokenURI (baseURI + tokenId)。
**安全检查**: 确保 token 存在。

#### 5. mint() 函数 (第 124-130 行)
```solidity
function mint(address to, uint256 tokenId) public {
    require(/**code*/ to != address(0), "ERC721: mint to the zero address");
    require(/**code*/ !_exists(tokenId), "ERC721: token already minted");

    /**code*/
    _balances[to] += 1;
    _owners[tokenId] = to;

    emit Transfer(address(0), to, tokenId);
}
```
**功能**: 铸造新的 NFT。
**安全检查**:
- 不能铸造给零地址
- tokenId 不能已存在
**状态更新**:
- 增加接收者余额
- 设置 token 所有者

#### 6. balanceOf() 函数 (第 136-139 行)
```solidity
function balanceOf(address owner) public view returns (uint256) {
    /**code*/
    require(owner != address(0), "ERC721: balance query for the zero address");
    return _balances[owner];
}
```
**功能**: 查询地址拥有的 NFT 数量。
**安全检查**: 不允许查询零地址。

#### 7. ownerOf() 函数 (第 143-147 行)
```solidity
function ownerOf(uint256 tokenId) public view returns (address) {
    /**code*/
    address owner = _owners[tokenId];
    require(owner != address(0), "ERC721: owner query for nonexistent token");
    return owner;
}
```
**功能**: 查询 NFT 的所有者。
**安全检查**: 确保 token 存在。

#### 8. approve() 函数 (第 151-159 行)
```solidity
function approve(address to, uint256 tokenId) public {
    address owner = ownerOf(tokenId);
    require(/**code*/ to != owner, "ERC721: approval to current owner");

    require(
        /**code*/
        msg.sender == owner || isApprovedForAll(owner, msg.sender),
        "ERC721: approve caller is not owner nor approved for all"
    );

   _approve(to, tokenId);
}
```
**功能**: 授权地址管理指定 NFT。
**安全检查**:
- 不能授权给当前所有者
- 调用者必须是所有者或已授权的操作员

#### 9. getApproved() 函数 (第 165-171 行)
```solidity
function getApproved(uint256 tokenId) public view returns (address) {
    require(
        /**code*/
        _exists(tokenId),
        "ERC721: approved query for nonexistent token"
    );

    /**code*/
    return _tokenApprovals[tokenId];
}
```
**功能**: 查询 NFT 的授权地址。
**安全检查**: 确保 token 存在。

#### 10. setApprovalForAll() 函数 (第 178-183 行)
```solidity
function setApprovalForAll(address operator, bool approved) public {
    address sender = msg.sender;
    require(/**code*/ operator != sender, "ERC721: approve to caller");

    /**code*/
    _operatorApprovals[sender][operator] = approved;

    emit ApprovalForAll(sender, operator, approved);
}
```
**功能**: 设置操作员授权。
**安全检查**: 不能授权给自己。

#### 11. isApprovedForAll() 函数 (第 192-195 行)
```solidity
function isApprovedForAll(
    address owner,
    address operator
) public view returns (bool) {
    /**code*/
    return _operatorApprovals[owner][operator];
}
```
**功能**: 查询操作员授权状态。

#### 12. _exists() 函数 (第 274-277 行)
```solidity
function _exists(uint256 tokenId) internal view returns (bool) {
    /**code*/
    return _owners[tokenId] != address(0);
}
```
**功能**: 检查 token 是否存在。
**逻辑**: 如果所有者不是零地址,则 token 存在。

#### 13. _isApprovedOrOwner() 函数 (第 289-294 行)
```solidity
function _isApprovedOrOwner(
    address spender,
    uint256 tokenId
) internal view returns (bool) {
    require(
        /**code*/
        _exists(tokenId),
        "ERC721: operator query for nonexistent token"
    );

    /**code*/
    address owner = ownerOf(tokenId);
    return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
}
```
**功能**: 检查地址是否有权限操作 token。
**检查三个条件**:
1. spender 是所有者
2. spender 是被授权的地址
3. spender 是被授权的操作员

#### 14. _transfer() 函数 (第 309-318 行)
```solidity
function _transfer(address from, address to, uint256 tokenId) internal {
    require(
       /**code*/
        ownerOf(tokenId) == from,
        "ERC721: transfer from incorrect owner"
    );

    require(/**code*/ to != address(0), "ERC721: transfer to the zero address");

    /**code*/
    // 清除之前的授权
    _approve(address(0), tokenId);

    // 更新余额
    _balances[from] -= 1;
    _balances[to] += 1;

    // 更新所有权
    _owners[tokenId] = to;

    emit Transfer(from, to, tokenId);
}
```
**功能**: 执行 NFT 转账。
**安全检查**:
- 确认 from 是当前所有者
- 不能转账给零地址
**状态更新**:
1. 清除授权
2. 减少发送方余额
3. 增加接收方余额
4. 更新所有权
5. 触发事件

#### 15. _approve() 函数 (第 326-330 行)
```solidity
function _approve(address to, uint256 tokenId) internal virtual {
    /**code*/
    _tokenApprovals[tokenId] = to;

    emit Approval(ownerOf(tokenId), to, tokenId);
}
```
**功能**: 内部授权函数,设置 token 的授权地址。

## 🔒 安全特性

### 1. 地址验证
- ✅ 所有涉及地址的操作都检查是否为零地址
- ✅ 防止向零地址铸造或转账

### 2. 存在性检查
- ✅ 所有查询和操作都验证 token 是否存在
- ✅ 防止操作不存在的 token

### 3. 权限控制
- ✅ 转账和授权都检查调用者权限
- ✅ 三层权限检查: 所有者、授权地址、授权操作员

### 4. 状态一致性
- ✅ 转账时清除授权,防止授权失效
- ✅ 正确更新余额和所有权
- ✅ 触发所有必要的事件

### 5. 重复铸造保护
- ✅ 铸造前检查 token 是否已存在
- ✅ 防止重复铸造相同的 tokenId

### 6. 安全转账
- ✅ 实现 `safeTransferFrom`,检查接收合约是否实现 ERC721Receiver
- ✅ 防止 NFT 被锁死在不支持的合约中

## 📊 状态变量

```solidity
mapping(uint256 => address) private _owners;              // tokenId => 所有者地址
mapping(address => uint256) private _balances;            // 地址 => NFT 数量
mapping(uint256 => address) private _tokenApprovals;      // tokenId => 授权地址
mapping(address => mapping(address => bool)) private _operatorApprovals;  // 所有者 => 操作员 => 是否授权
```

## 🎯 使用示例

### 部署合约
```solidity
BaseERC721 nft = new BaseERC721(
    "My NFT Collection",           // 名称
    "MNFT",                        // 符号
    "https://api.example.com/nft/" // baseURI
);
```

### 铸造 NFT
```solidity
nft.mint(userAddress, 1);  // 铸造 tokenId 为 1 的 NFT 给 userAddress
```

### 查询所有者
```solidity
address owner = nft.ownerOf(1);  // 查询 tokenId 1 的所有者
```

### 授权
```solidity
nft.approve(spenderAddress, 1);  // 授权 spenderAddress 管理 tokenId 1
```

### 转账
```solidity
nft.transferFrom(fromAddress, toAddress, 1);  // 转移 tokenId 1
```

### 安全转账
```solidity
nft.safeTransferFrom(fromAddress, toAddress, 1);  // 安全转移,检查接收方
```

## ✨ ERC721Receiver 合约

```solidity
contract BaseERC721Receiver is IERC721Receiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
```

**用途**: 允许合约安全接收 NFT。
**实现**: 返回正确的函数选择器,表明合约知道如何处理 ERC721 token。

## 🔍 代码对比

### 查看差异
你可以对比两个文件来验证只修改了 `/**code*/` 标记的位置:

```bash
# 使用 diff 工具
diff d8/erc721.sol d8/erc721-all.sol

# 或使用 VS Code 的文件对比功能
```

### 修改位置汇总
所有修改都在以下函数中的 `/**code*/` 位置:

1. ✅ `constructor` - 初始化状态变量
2. ✅ `name` - 返回名称
3. ✅ `symbol` - 返回符号
4. ✅ `tokenURI` - 存在性检查 + 返回 URI
5. ✅ `mint` - 地址检查 + 存在性检查 + 状态更新
6. ✅ `balanceOf` - 地址检查 + 返回余额
7. ✅ `ownerOf` - 查询并验证所有者
8. ✅ `approve` - 授权检查 + 权限验证
9. ✅ `getApproved` - 存在性检查 + 返回授权地址
10. ✅ `setApprovalForAll` - 自授权检查 + 设置授权
11. ✅ `isApprovedForAll` - 返回授权状态
12. ✅ `_exists` - 检查 token 存在性
13. ✅ `_isApprovedOrOwner` - 存在性检查 + 权限检查
14. ✅ `_transfer` - 所有者验证 + 地址检查 + 状态更新
15. ✅ `_approve` - 设置授权

## 🧪 测试建议

### 基础功能测试
```solidity
// 1. 测试铸造
mint(address1, 1)
assert ownerOf(1) == address1
assert balanceOf(address1) == 1

// 2. 测试授权
approve(address2, 1)
assert getApproved(1) == address2

// 3. 测试转账
transferFrom(address1, address3, 1)
assert ownerOf(1) == address3
assert getApproved(1) == address(0)  // 授权已清除

// 4. 测试操作员授权
setApprovalForAll(address4, true)
assert isApprovedForAll(address1, address4) == true
```

### 安全性测试
```solidity
// 1. 测试零地址保护
mint(address(0), 2)  // 应该失败

// 2. 测试重复铸造
mint(address1, 1)
mint(address2, 1)  // 应该失败,tokenId 1 已存在

// 3. 测试未授权转账
// address5 没有权限转移 address1 的 token
transferFrom(address1, address5, 1)  // 应该失败

// 4. 测试安全转账
safeTransferFrom(address1, contractAddress, 1)
// 如果 contractAddress 没有实现 onERC721Received,应该失败
```

## 📚 ERC721 标准参考

- **EIP-721**: https://eips.ethereum.org/EIPS/eip-721
- **OpenZeppelin ERC721**: https://docs.openzeppelin.com/contracts/5.x/erc721

## 📄 许可证

MIT License

---

**注意**: 本合约仅用于教育目的。在生产环境使用前,请进行完整的安全审计。
