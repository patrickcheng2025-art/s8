const hre = require("hardhat");

async function main() {
  console.log("开始部署 MyNFT 合约...");

  // 获取合约工厂
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");

  // 部署参数
  const name = "My Cool NFT Collection";
  const symbol = "COOL";
  const maxSupply = 1000; // 最大供应量,设为 0 表示无限制
  const mintPrice = hre.ethers.parseEther("0"); // 铸造价格,这里设为免费

  console.log("部署参数:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Max Supply:", maxSupply);
  console.log("- Mint Price:", hre.ethers.formatEther(mintPrice), "ETH");

  // 部署合约
  const nft = await MyNFT.deploy(name, symbol, maxSupply, mintPrice);

  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();

  console.log("\n✅ MyNFT 合约部署成功!");
  console.log("合约地址:", contractAddress);
  console.log("\n请将此地址保存到 .env 文件中:");
  console.log(`NFT_CONTRACT_ADDRESS=${contractAddress}`);

  // 等待几个区块确认
  console.log("\n等待区块确认...");
  await nft.deploymentTransaction().wait(5);

  // 在 Etherscan 上验证合约
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n开始在 Etherscan 上验证合约...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [name, symbol, maxSupply, mintPrice],
      });
      console.log("✅ 合约验证成功!");
    } catch (error) {
      console.log("❌ 合约验证失败:", error.message);
    }
  }

  console.log("\n下一步:");
  console.log("1. 将图片上传到 IPFS");
  console.log("2. 更新 metadata JSON 文件中的图片 CID");
  console.log("3. 将 metadata 上传到 IPFS");
  console.log("4. 运行 mint.js 脚本铸造 NFT");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
