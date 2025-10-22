// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MyNFT
 * @dev ERC721 NFT 合约,支持铸造和设置 tokenURI
 * @dev 使用 OpenZeppelin 库实现标准 ERC721 功能
 */
contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // Token ID 计数器
    Counters.Counter private _tokenIdCounter;

    // 最大供应量
    uint256 public maxSupply;

    // 铸造价格(可设为0表示免费)
    uint256 public mintPrice;

    // 事件: NFT 铸造成功
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI
    );

    // 事件: 铸造价格更新
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);

    /**
     * @dev 构造函数
     * @param name NFT 集合名称
     * @param symbol NFT 符号
     * @param _maxSupply 最大供应量(0表示无限制)
     * @param _mintPrice 铸造价格(wei)
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(name, symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }

    /**
     * @dev 铸造 NFT
     * @param to 接收者地址
     * @param uri Token 的元数据 URI (IPFS 链接)
     * @return tokenId 新铸造的 Token ID
     */
    function mintNFT(address to, string memory uri)
        public
        payable
        returns (uint256)
    {
        // 检查是否支付了足够的铸造费用
        require(msg.value >= mintPrice, "Insufficient payment");

        // 检查是否达到最大供应量
        uint256 tokenId = _tokenIdCounter.current();
        if (maxSupply > 0) {
            require(tokenId < maxSupply, "Max supply reached");
        }

        // 铸造 NFT
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit NFTMinted(to, tokenId, uri);

        return tokenId;
    }

    /**
     * @dev 批量铸造 NFT (仅限 owner)
     * @param to 接收者地址
     * @param uris Token 的元数据 URI 数组
     */
    function batchMint(address to, string[] memory uris)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < uris.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();

            if (maxSupply > 0) {
                require(tokenId < maxSupply, "Max supply reached");
            }

            _tokenIdCounter.increment();
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);

            emit NFTMinted(to, tokenId, uris[i]);
        }
    }

    /**
     * @dev 更新 Token URI (仅限 owner)
     * @param tokenId Token ID
     * @param uri 新的 URI
     */
    function updateTokenURI(uint256 tokenId, string memory uri)
        public
        onlyOwner
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev 设置铸造价格 (仅限 owner)
     * @param newPrice 新的铸造价格
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @dev 提取合约余额 (仅限 owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev 获取当前已铸造的 NFT 总数
     * @return 已铸造的 NFT 数量
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev 检查 Token 是否存在
     * @param tokenId Token ID
     * @return 是否存在
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev 获取指定地址拥有的所有 Token ID
     * @param owner 地址
     * @return Token ID 数组
     */
    function tokensOfOwner(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;

        uint256 totalTokens = _tokenIdCounter.current();
        for (uint256 i = 0; i < totalTokens && index < tokenCount; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }

        return tokenIds;
    }

    // 重写必要的函数以解决继承冲突
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
