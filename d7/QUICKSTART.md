# NFT 项目快速开始指南 ⚡

5 步完成 NFT 部署和铸造!

## 🎯 前置准备 (一次性设置)

### 1. 安装 Node.js

确保已安装 Node.js (v16 或更高):
```bash
node --version
npm --version
```

下载: https://nodejs.org/

### 2. 准备钱包

- 安装 MetaMask 浏览器插件
- 创建钱包账户
- 导出私钥(用于部署合约)
- 从水龙头获取 Sepolia 测试网 ETH

**Sepolia 水龙头:**
- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia

### 3. 注册服务账号

**Alchemy** (区块链节点服务):
1. 访问 https://www.alchemy.com/
2. 注册并创建应用
3. 选择 Sepolia 网络
4. 复制 HTTPS RPC URL

**Pinata** (IPFS 存储服务):
1. 访问 https://www.pinata.cloud/
2. 注册免费账号
3. 创建 API Key
4. 记录 API Key 和 Secret

**Etherscan** (合约验证):
1. 访问 https://etherscan.io/
2. 注册账号
3. 创建 API Key

---

## 🚀 5 步部署流程

### 步骤 1: 安装依赖 📦

```bash
cd d7
npm install
```

如果遇到依赖冲突:
```bash
npm install --legacy-peer-deps
```

### 步骤 2: 配置环境 ⚙️

**2.1 复制配置文件:**
```bash
cp .env.example .env
```

**2.2 编辑 `.env` 文件,填入你的配置:**

```env
# 你的钱包私钥(从 MetaMask 导出)
PRIVATE_KEY=0x你的私钥

# Alchemy Sepolia RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/你的API密钥

# Etherscan API Key
ETHERSCAN_API_KEY=你的API密钥

# Pinata API Keys
PINATA_API_KEY=你的API密钥
PINATA_SECRET_KEY=你的密钥
```

**⚠️ 安全提示:**
- 永远不要分享或提交你的私钥!
- 不要将 `.env` 文件上传到 GitHub!

### 步骤 3: 准备 NFT 资源 🎨

**3.1 准备图片:**

将你的 NFT 图片放入 `images/` 目录:
```
d7/images/
├── 1.png
├── 2.png
└── 3.png
```

**图片要求:**
- 格式: PNG, JPG, GIF, 或 SVG
- 尺寸: 推荐 1000x1000 像素
- 文件大小: < 10 MB

**没有图片?** 可以使用 AI 生成:
- **Midjourney**: `/imagine cute cartoon cat, digital art, 1:1`
- **Leonardo.ai**: https://leonardo.ai/ (免费)
- **DALL-E 3**: https://labs.openai.com/

**3.2 编辑元数据:**

编辑 `metadata/` 目录中的 JSON 文件:

```json
{
  "name": "你的 NFT #1",
  "description": "这是我的第一个 NFT!",
  "attributes": [
    {
      "trait_type": "类型",
      "value": "猫"
    },
    {
      "trait_type": "稀有度",
      "value": "普通"
    }
  ]
}
```

**3.3 上传到 IPFS:**

```bash
npm run upload-ipfs
```

成功输出:
```
✅ 1.png -> ipfs://QmXxx...
✅ 1.json -> ipfs://QmYyyy...
✅ 已保存到: tokenURIs.json
```

### 步骤 4: 部署合约 🚢

```bash
npm run deploy
```

成功输出:
```
✅ MyNFT 合约部署成功!
合约地址: 0xABCDEF...
✅ 合约验证成功!
```

**保存合约地址到 `.env`:**
```env
NFT_CONTRACT_ADDRESS=0x你的合约地址
```

### 步骤 5: 铸造 NFT 🎉

```bash
npm run mint
```

成功输出:
```
✅ Token 0 铸造成功!
✅ Token 1 铸造成功!
✅ Token 2 铸造成功!

OpenSea 链接:
https://testnets.opensea.io/assets/sepolia/0x你的合约地址/0
```

---

## 🎊 完成!

### 查看你的 NFT

**OpenSea (测试网):**
```
https://testnets.opensea.io/assets/sepolia/<合约地址>/<Token ID>
```

**Etherscan (查看合约):**
```
https://sepolia.etherscan.io/address/<合约地址>
```

### 注意事项

- ⏰ NFT 可能需要 5-10 分钟才能在 OpenSea 上显示
- 🔄 如果没有显示,点击 "Refresh metadata" 按钮
- 📱 可以在 MetaMask 移动端查看你的 NFT

---

## 🎯 完整命令总结

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 然后编辑 .env 文件

# 3. 准备图片和元数据,然后上传
npm run upload-ipfs

# 4. 部署合约
npm run deploy
# 将合约地址添加到 .env

# 5. 铸造 NFT
npm run mint
```

---

## 📊 项目结构一览

```
d7/
├── contracts/
│   └── MyNFT.sol           # ERC721 NFT 合约
├── scripts/
│   ├── deploy.js           # 部署脚本
│   ├── uploadToIPFS.js     # IPFS 上传脚本
│   └── mint.js             # 铸造脚本
├── metadata/
│   ├── 1.json              # NFT #1 元数据
│   ├── 2.json              # NFT #2 元数据
│   └── 3.json              # NFT #3 元数据
├── images/
│   ├── 1.png               # NFT #1 图片
│   ├── 2.png               # NFT #2 图片
│   └── 3.png               # NFT #3 图片
├── .env                    # 环境变量 (你需要创建)
├── .env.example            # 环境变量模板
├── hardhat.config.js       # Hardhat 配置
├── package.json            # 项目依赖
├── README.md               # 完整文档
└── QUICKSTART.md           # 本文件
```

---

## 🐛 遇到问题?

### 问题 1: `npm install` 失败

**解决:**
```bash
npm install --legacy-peer-deps
```

### 问题 2: 上传 IPFS 失败

**检查:**
- ✅ Pinata API Keys 是否正确
- ✅ 图片文件是否存在于 `images/` 目录
- ✅ 网络连接是否正常

### 问题 3: 部署合约失败

**检查:**
- ✅ 私钥是否正确
- ✅ 是否有足够的 Sepolia ETH
- ✅ RPC URL 是否正确

### 问题 4: 铸造失败

**检查:**
- ✅ 合约地址是否已添加到 `.env`
- ✅ `tokenURIs.json` 文件是否存在
- ✅ 是否有足够的 ETH 支付 gas

### 问题 5: OpenSea 上看不到 NFT

**解决:**
- ⏰ 等待 5-10 分钟
- 🔄 点击 "Refresh metadata"
- 🔍 检查元数据格式是否正确
- 🌐 访问 IPFS 网关确认图片可访问

---

## 📚 更多资源

- **完整文档**: 查看 `README.md`
- **合约代码**: 查看 `contracts/MyNFT.sol`
- **OpenZeppelin**: https://docs.openzeppelin.com/contracts/5.x/erc721
- **Hardhat**: https://hardhat.org/getting-started
- **OpenSea**: https://docs.opensea.io/docs/metadata-standards

---

## 🎓 下一步学习

学会基础后,可以尝试:

1. **添加白名单铸造**
2. **实现盲盒功能**
3. **设置版税(ERC2981)**
4. **集成 Chainlink VRF(随机性)**
5. **创建铸造网站前端**
6. **部署到以太坊主网**

祝你成功! 🚀🎉
