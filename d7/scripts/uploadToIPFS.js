const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
require('dotenv').config();

/**
 * 使用 Pinata 上传文件到 IPFS
 * Pinata 是一个流行的 IPFS 固定服务
 */

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.error('❌ 错误: 请在 .env 文件中设置 PINATA_API_KEY 和 PINATA_SECRET_KEY');
  console.error('获取 API Key: https://www.pinata.cloud/');
  process.exit(1);
}

/**
 * 上传单个文件到 IPFS
 */
async function uploadFileToIPFS(filePath) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  const metadata = JSON.stringify({
    name: path.basename(filePath),
  });
  data.append('pinataMetadata', metadata);

  try {
    const response = await axios.post(url, data, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('上传文件失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 上传 JSON 数据到 IPFS
 */
async function uploadJSONToIPFS(json, name) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const data = {
    pinataContent: json,
    pinataMetadata: {
      name: name,
    },
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('上传 JSON 失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 主函数: 上传图片和元数据
 */
async function main() {
  console.log('🚀 开始上传 NFT 资源到 IPFS...\n');

  const imagesDir = path.join(__dirname, '../images');
  const metadataDir = path.join(__dirname, '../metadata');

  // 检查目录是否存在
  if (!fs.existsSync(imagesDir)) {
    console.error('❌ 错误: images 目录不存在');
    console.error('请在 d7/images/ 目录中放置你的 NFT 图片');
    process.exit(1);
  }

  // 步骤 1: 上传所有图片
  console.log('📸 步骤 1: 上传图片到 IPFS...');
  const imageFiles = fs.readdirSync(imagesDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.error('❌ 错误: images 目录中没有图片文件');
    console.error('支持的格式: .png, .jpg, .jpeg, .gif, .svg');
    process.exit(1);
  }

  const imageCIDs = {};
  for (const imageFile of imageFiles) {
    const filePath = path.join(imagesDir, imageFile);
    console.log(`  上传: ${imageFile}...`);

    try {
      const cid = await uploadFileToIPFS(filePath);
      imageCIDs[imageFile] = cid;
      console.log(`  ✅ ${imageFile} -> ipfs://${cid}`);
    } catch (error) {
      console.error(`  ❌ ${imageFile} 上传失败`);
    }
  }

  console.log('\n📊 图片上传完成! CID 列表:');
  console.log(JSON.stringify(imageCIDs, null, 2));

  // 步骤 2: 更新元数据并上传
  console.log('\n📝 步骤 2: 更新并上传元数据到 IPFS...');

  if (!fs.existsSync(metadataDir)) {
    console.error('❌ 错误: metadata 目录不存在');
    process.exit(1);
  }

  const metadataFiles = fs.readdirSync(metadataDir).filter(file =>
    file.endsWith('.json')
  );

  if (metadataFiles.length === 0) {
    console.error('❌ 错误: metadata 目录中没有 JSON 文件');
    process.exit(1);
  }

  const tokenURIs = [];

  for (const metadataFile of metadataFiles) {
    const filePath = path.join(metadataDir, metadataFile);
    console.log(`  处理: ${metadataFile}...`);

    try {
      // 读取元数据
      const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // 如果有对应的图片,更新图片 CID
      const tokenNumber = path.basename(metadataFile, '.json');
      const imageFile = Object.keys(imageCIDs).find(img =>
        img.startsWith(tokenNumber)
      );

      if (imageFile) {
        metadata.image = `ipfs://${imageCIDs[imageFile]}`;
        console.log(`    更新图片链接: ipfs://${imageCIDs[imageFile]}`);
      }

      // 上传元数据到 IPFS
      const cid = await uploadJSONToIPFS(metadata, metadataFile);
      const tokenURI = `ipfs://${cid}`;
      tokenURIs.push(tokenURI);

      console.log(`  ✅ ${metadataFile} -> ${tokenURI}`);
    } catch (error) {
      console.error(`  ❌ ${metadataFile} 处理失败:`, error.message);
    }
  }

  // 步骤 3: 保存结果
  console.log('\n💾 保存 Token URIs...');
  const outputPath = path.join(__dirname, '../tokenURIs.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ tokenURIs, imageCIDs }, null, 2)
  );
  console.log(`✅ 已保存到: ${outputPath}`);

  // 显示汇总
  console.log('\n' + '='.repeat(60));
  console.log('🎉 上传完成! 汇总信息:');
  console.log('='.repeat(60));
  console.log(`\n已上传 ${imageFiles.length} 个图片`);
  console.log(`已上传 ${tokenURIs.length} 个元数据\n`);

  console.log('Token URIs:');
  tokenURIs.forEach((uri, index) => {
    console.log(`  Token ${index}: ${uri}`);
  });

  console.log('\n下一步:');
  console.log('1. 运行部署脚本: npm run deploy');
  console.log('2. 运行铸造脚本: npm run mint');
  console.log('3. 在 OpenSea 上查看你的 NFT!');

  console.log('\nOpenSea 链接 (Sepolia 测试网):');
  console.log('https://testnets.opensea.io/assets/sepolia/<YOUR_CONTRACT_ADDRESS>/<TOKEN_ID>');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
