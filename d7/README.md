# NFT 项目完整指南 🎨

这是一个使用 ERC721 标准创建和部署 NFT 的完整项目,包含图片和元数据上传到去中心化存储(IPFS)。

## 📋 目录结构

```
d7/
├── contracts/          # Solidity 智能合约
│   └── MyNFT.sol      # ERC721 NFT 合约
├── scripts/           # 部署和工具脚本
│   ├── deploy.js      # 部署合约脚本
│   ├── uploadToIPFS.js # 上传到 IPFS 脚本
│   └── mint.js        # 铸造 NFT 脚本
├── metadata/          # NFT 元数据 JSON 文件
│   ├── 1.json
│   ├── 2.json
│   └── 3.json
├── images/            # NFT 图片文件(需要自己添加)
│   ├── 1.png
│   ├── 2.png
│   └── 3.png
├── .env.example       # 环境变量示例
├── hardhat.config.js  # Hardhat 配置
└── package.json       # 项目依赖
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd d7
npm install
```

如果使用 npm 遇到问题,可以尝试:
```bash
npm install --legacy-peer-deps
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置:

```bash
cp .env.example .env
```

编辑 `.env` 文件:

```env
# 私钥 (从 MetaMask 导出)
PRIVATE_KEY=你的私钥

# Sepolia 测试网 RPC URL (从 Alchemy 或 Infura 获取)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# Etherscan API Key (用于验证合约)
ETHERSCAN_API_KEY=你的_Etherscan_API_Key

# Pinata API Keys (用于上传到 IPFS)
PINATA_API_KEY=你的_Pinata_API_Key
PINATA_SECRET_KEY=你的_Pinata_Secret_Key
```

### 3. 准备 NFT 图片

在 `d7/images/` 目录中放置你的 NFT 图片:

```
images/
├── 1.png    # 对应 metadata/1.json
├── 2.png    # 对应 metadata/2.json
└── 3.png    # 对应 metadata/3.json
```

**支持的图片格式:**
- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- SVG (.svg)

### 4. 编辑元数据

编辑 `metadata/` 目录中的 JSON 文件,自定义你的 NFT 属性:

```json
{
  "name": "你的 NFT 名称 #1",
  "description": "NFT 描述",
  "image": "ipfs://YOUR_IMAGE_CID_HERE",
  "attributes": [
    {
      "trait_type": "属性类型",
      "value": "属性值"
    }
  ]
}
```

## 📝 完整部署流程

### 步骤 1: 上传到 IPFS

运行上传脚本,将图片和元数据上传到 IPFS:

```bash
npm run upload-ipfs
```

这个脚本会:
1. ✅ 上传所有图片到 IPFS (通过 Pinata)
2. ✅ 自动更新元数据 JSON 中的图片 CID
3. ✅ 上传元数据 JSON 到 IPFS
4. ✅ 生成 `tokenURIs.json` 文件保存所有 Token URIs

**输出示例:**
```
📸 步骤 1: 上传图片到 IPFS...
  上传: 1.png...
  ✅ 1.png -> ipfs://QmXxx...

📝 步骤 2: 更新并上传元数据到 IPFS...
  处理: 1.json...
    更新图片链接: ipfs://QmXxx...
  ✅ 1.json -> ipfs://QmYyyy...
```

### 步骤 2: 部署合约

部署 NFT 合约到 Sepolia 测试网:

```bash
npm run deploy
```

这个脚本会:
1. ✅ 部署 MyNFT 合约
2. ✅ 等待区块确认
3. ✅ 在 Etherscan 上验证合约
4. ✅ 显示合约地址

**将合约地址保存到 `.env` 文件:**
```env
NFT_CONTRACT_ADDRESS=0x你的合约地址
```

### 步骤 3: 铸造 NFT

运行铸造脚本创建 NFT:

```bash
npm run mint
```

这个脚本会:
1. ✅ 读取 `tokenURIs.json` 中的 Token URIs
2. ✅ 为每个 Token URI 铸造一个 NFT
3. ✅ 生成 `mintedNFTs.json` 保存铸造记录
4. ✅ 显示 OpenSea 链接

**输出示例:**
```
[1/3] 铸造 Token 0...
Token URI: ipfs://QmYyyy...
交易哈希: 0xabc123...
✅ Token 0 铸造成功!

OpenSea 链接:
Token 0:
https://testnets.opensea.io/assets/sepolia/0x你的合约地址/0
```

## 🔧 详细配置说明

### 获取 Alchemy API Key

1. 访问 [Alchemy](https://www.alchemy.com/)
2. 注册账号并创建新应用
3. 选择 **Sepolia** 测试网
4. 复制 HTTPS RPC URL

### 获取 Etherscan API Key

1. 访问 [Etherscan](https://etherscan.io/)
2. 注册账号
3. 进入 [API Keys](https://etherscan.io/myapikey)
4. 创建新的 API Key

### 获取 Pinata API Keys

1. 访问 [Pinata](https://www.pinata.cloud/)
2. 注册账号
3. 进入 [API Keys](https://app.pinata.cloud/keys)
4. 创建新的 API Key
5. 获取 `API Key` 和 `API Secret`

### 获取测试 ETH

在 Sepolia 测试网上需要 ETH 来支付 gas 费用:

1. **Sepolia Faucet**: https://sepoliafaucet.com/
2. **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
3. **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia

## 📖 合约功能说明

### MyNFT 合约 ([contracts/MyNFT.sol](contracts/MyNFT.sol))

基于 OpenZeppelin 的 ERC721 标准实现。

**主要功能:**

```solidity
// 铸造单个 NFT
function mintNFT(address to, string memory uri) public payable returns (uint256)

// 批量铸造 NFT (仅 owner)
function batchMint(address to, string[] memory uris) public onlyOwner

// 更新 Token URI (仅 owner)
function updateTokenURI(uint256 tokenId, string memory uri) public onlyOwner

// 设置铸造价格 (仅 owner)
function setMintPrice(uint256 newPrice) public onlyOwner

// 提取合约余额 (仅 owner)
function withdraw() public onlyOwner

// 查询总供应量
function totalSupply() public view returns (uint256)

// 查询地址拥有的所有 Token
function tokensOfOwner(address owner) public view returns (uint256[] memory)
```

**合约特性:**

- ✅ 使用 OpenZeppelin 库,安全可靠
- ✅ 支持设置最大供应量
- ✅ 支持设置铸造价格(可免费)
- ✅ Owner 权限管理
- ✅ 批量铸造功能
- ✅ 支持动态更新 Token URI

## 🌐 在 OpenSea 上查看

### Sepolia 测试网

NFT 铸造成功后,可以在 OpenSea 测试网上查看:

```
https://testnets.opensea.io/assets/sepolia/<合约地址>/<Token ID>
```

**查看整个集合:**
```
https://testnets.opensea.io/collection/<集合slug>
```

### 主网

如果部署到以太坊主网:

```
https://opensea.io/assets/ethereum/<合约地址>/<Token ID>
```

## 📊 元数据标准

NFT 元数据遵循 OpenSea 标准:

```json
{
  "name": "NFT 名称",
  "description": "NFT 描述",
  "image": "ipfs://QmXxx...",
  "external_url": "https://你的网站.com",
  "background_color": "FFFFFF",
  "attributes": [
    {
      "trait_type": "属性名称",
      "value": "属性值"
    },
    {
      "trait_type": "稀有度",
      "value": "传奇",
      "display_type": "string"
    },
    {
      "trait_type": "等级",
      "value": 5,
      "max_value": 10,
      "display_type": "number"
    }
  ],
  "animation_url": "ipfs://QmYyy...",
  "youtube_url": "https://www.youtube.com/watch?v=xxx"
}
```

**属性说明:**

- `name`: NFT 名称(必需)
- `description`: NFT 描述(必需)
- `image`: 图片 IPFS 链接(必需)
- `external_url`: 外部链接(可选)
- `background_color`: 背景颜色,6位十六进制(可选)
- `attributes`: 属性数组(可选,但推荐)
- `animation_url`: 动画/视频 IPFS 链接(可选)
- `youtube_url`: YouTube 视频链接(可选)

**display_type 类型:**

- 不设置: 显示为文本
- `"number"`: 显示为数字进度条
- `"boost_number"`: 显示为加成数值
- `"boost_percentage"`: 显示为加成百分比
- `"date"`: 显示为日期(Unix 时间戳)

## 🎨 创建 NFT 图片建议

### 图片尺寸

- **推荐尺寸**: 1000x1000 像素或更大
- **纵横比**: 1:1 (正方形)最常见
- **文件大小**: 建议 < 10MB

### 图片格式

1. **PNG**: 支持透明背景,适合艺术作品
2. **JPEG**: 文件较小,适合照片
3. **GIF**: 支持动画
4. **SVG**: 矢量图形,文件小且可无限缩放

### 设计工具推荐

- **Adobe Photoshop**: 专业图像编辑
- **GIMP**: 免费的 Photoshop 替代品
- **Canva**: 在线设计工具
- **Figma**: UI/UX 设计工具
- **Procreate**: iPad 绘画应用

### AI 生成工具

- **Midjourney**: Discord 机器人,生成高质量 AI 艺术
- **DALL-E 3**: OpenAI 的图像生成模型
- **Stable Diffusion**: 开源图像生成模型
- **Leonardo.ai**: 免费的 AI 图像生成平台

## 🔍 验证和测试

### 本地测试

运行 Hardhat 测试:

```bash
npx hardhat test
```

### 编译合约

```bash
npm run compile
```

### 查看合约信息

使用 Hardhat console:

```bash
npx hardhat console --network sepolia
```

然后在 console 中:

```javascript
const MyNFT = await ethers.getContractFactory("MyNFT");
const nft = MyNFT.attach("你的合约地址");

// 查询总供应量
await nft.totalSupply();

// 查询 Token URI
await nft.tokenURI(0);

// 查询拥有者
await nft.ownerOf(0);
```

## 🐛 常见问题

### Q1: 上传到 IPFS 失败

**原因:** Pinata API Keys 不正确或网络问题

**解决:**
1. 检查 `.env` 文件中的 API Keys
2. 确认 Pinata 账户正常
3. 尝试使用其他 IPFS 服务(如 NFT.Storage)

### Q2: 部署合约失败

**原因:**
- 私钥不正确
- 测试 ETH 不足
- RPC URL 不正确

**解决:**
1. 检查 `.env` 中的 `PRIVATE_KEY`
2. 从水龙头获取测试 ETH
3. 使用有效的 Alchemy/Infura RPC URL

### Q3: NFT 在 OpenSea 上不显示

**原因:** OpenSea 需要时间索引 NFT

**解决:**
1. 等待 5-10 分钟
2. 刷新元数据: 点击 OpenSea 上的 "Refresh metadata" 按钮
3. 检查元数据格式是否正确
4. 确认图片 IPFS 链接可访问

### Q4: 图片加载失败

**原因:** IPFS 网关响应慢或图片未固定

**解决:**
1. 使用 Pinata 的专用网关
2. 确认图片已成功上传到 IPFS
3. 尝试访问: `https://gateway.pinata.cloud/ipfs/<CID>`

## 📚 扩展学习

### OpenZeppelin 文档

- [ERC721 指南](https://docs.openzeppelin.com/contracts/5.x/erc721)
- [访问控制](https://docs.openzeppelin.com/contracts/5.x/access-control)

### Hardhat 文档

- [Hardhat 入门](https://hardhat.org/getting-started)
- [部署合约](https://hardhat.org/guides/deploying.html)

### OpenSea 文档

- [元数据标准](https://docs.opensea.io/docs/metadata-standards)
- [创建者指南](https://docs.opensea.io/docs/creators)

### IPFS 学习

- [IPFS 文档](https://docs.ipfs.tech/)
- [Pinata 文档](https://docs.pinata.cloud/)

## 🚀 进阶功能

### 1. 添加白名单

```solidity
mapping(address => bool) public whitelist;

function addToWhitelist(address[] memory addresses) public onlyOwner {
    for (uint i = 0; i < addresses.length; i++) {
        whitelist[addresses[i]] = true;
    }
}

modifier onlyWhitelisted() {
    require(whitelist[msg.sender], "Not whitelisted");
    _;
}
```

### 2. 盲盒功能

在铸造时使用占位符 URI,稍后揭晓:

```solidity
bool public revealed = false;
string public notRevealedUri;

function tokenURI(uint256 tokenId) public view override returns (string memory) {
    if (!revealed) {
        return notRevealedUri;
    }
    return super.tokenURI(tokenId);
}

function reveal() public onlyOwner {
    revealed = true;
}
```

### 3. 版税设置

使用 ERC2981 标准:

```solidity
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract MyNFT is ERC721, ERC2981 {
    constructor() {
        _setDefaultRoyalty(owner(), 500); // 5% 版税
    }
}
```

### 4. 集成 Chainlink VRF

添加随机性:

```solidity
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

// 使用 Chainlink VRF 生成随机属性
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests!

## 📞 支持

如有问题,请:
1. 查看本文档的常见问题部分
2. 搜索相关 GitHub Issues
3. 在 Discord/Telegram 社区求助

---

祝你成功创建自己的 NFT 项目! 🎉
