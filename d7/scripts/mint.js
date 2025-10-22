const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log("开始铸造 NFT...\n");

  // 获取合约地址
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ 错误: 请在 .env 文件中设置 NFT_CONTRACT_ADDRESS");
    console.error("先运行: npm run deploy");
    process.exit(1);
  }

  // 读取 Token URIs
  const tokenURIsPath = path.join(__dirname, '../tokenURIs.json');
  if (!fs.existsSync(tokenURIsPath)) {
    console.error("❌ 错误: 找不到 tokenURIs.json 文件");
    console.error("先运行: npm run upload-ipfs");
    process.exit(1);
  }

  const { tokenURIs } = JSON.parse(fs.readFileSync(tokenURIsPath, 'utf8'));

  if (!tokenURIs || tokenURIs.length === 0) {
    console.error("❌ 错误: tokenURIs.json 中没有 Token URIs");
    process.exit(1);
  }

  // 连接到合约
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(contractAddress);

  console.log("合约地址:", contractAddress);
  console.log("准备铸造", tokenURIs.length, "个 NFT\n");

  // 获取签名者(铸造者)
  const [signer] = await hre.ethers.getSigners();
  const minterAddress = await signer.getAddress();
  console.log("铸造者地址:", minterAddress);

  // 获取铸造价格
  const mintPrice = await nft.mintPrice();
  console.log("铸造价格:", hre.ethers.formatEther(mintPrice), "ETH\n");

  // 铸造每个 NFT
  console.log("开始铸造...");
  const mintedTokens = [];

  for (let i = 0; i < tokenURIs.length; i++) {
    const tokenURI = tokenURIs[i];
    console.log(`\n[${i + 1}/${tokenURIs.length}] 铸造 Token ${i}...`);
    console.log("Token URI:", tokenURI);

    try {
      // 铸造 NFT
      const tx = await nft.mintNFT(minterAddress, tokenURI, {
        value: mintPrice,
      });

      console.log("交易哈希:", tx.hash);
      console.log("等待确认...");

      const receipt = await tx.wait();
      console.log("✅ Token", i, "铸造成功!");
      console.log("Gas 使用:", receipt.gasUsed.toString());

      // 从事件中获取 token ID
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = nft.interface.parseLog(log);
          return parsedLog && parsedLog.name === 'NFTMinted';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = nft.interface.parseLog(event);
        const tokenId = parsedEvent.args.tokenId.toString();
        mintedTokens.push({
          tokenId,
          tokenURI,
          transactionHash: tx.hash,
        });
      }
    } catch (error) {
      console.error("❌ 铸造失败:", error.message);
    }
  }

  // 显示汇总
  console.log("\n" + "=".repeat(60));
  console.log("🎉 铸造完成! 汇总信息:");
  console.log("=".repeat(60));
  console.log(`\n成功铸造 ${mintedTokens.length} 个 NFT\n`);

  // 保存铸造记录
  const outputPath = path.join(__dirname, '../mintedNFTs.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ contractAddress, network: hre.network.name, mintedTokens }, null, 2)
  );
  console.log("铸造记录已保存到:", outputPath, "\n");

  // 显示 OpenSea 链接
  console.log("OpenSea 链接:");
  const baseURL =
    hre.network.name === "sepolia"
      ? "https://testnets.opensea.io"
      : "https://opensea.io";

  for (const token of mintedTokens) {
    const url = `${baseURL}/assets/${hre.network.name}/${contractAddress}/${token.tokenId}`;
    console.log(`\nToken ${token.tokenId}:`);
    console.log(url);
  }

  console.log("\n" + "=".repeat(60));
  console.log("注意: NFT 可能需要几分钟才能在 OpenSea 上显示");
  console.log("如果没有立即显示,请稍后刷新页面");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
