// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TokenBank
 * @dev ERC20 代币银行合约,支持存取 ERC20 代币
 */
contract TokenBank {
    // 管理员地址
    address public immutable owner;

    // 记录每个用户在不同代币合约中的存款金额
    // 用户地址 => 代币合约地址 => 存款金额
    mapping(address => mapping(address => uint256)) public balances;

    // 记录每种代币的前3名存款者
    // 代币合约地址 => 前3名地址数组
    mapping(address => address[3]) public topDepositors;

    // 代币合约地址 => 前3名存款金额数组
    mapping(address => uint256[3]) public topAmounts;

    // 事件定义
    event Deposited(address indexed token, address indexed user, uint256 amount);
    event Withdrawn(address indexed token, address indexed user, uint256 amount);

    /**
     * @dev 构造函数,设置部署者为管理员
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev modifier: 检查是否为管理员
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev 存款函数 - 需要用户先授权(approve)
     * @param token ERC20 代币合约地址
     * @param amount 存款数量
     */
    function deposit(address token, uint256 amount) public virtual {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Deposit amount must be greater than 0");

        // 从用户账户转移代币到本合约
        // 注意:用户需要先调用 token.approve(address(this), amount)
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");

        // 更新用户余额
        balances[msg.sender][token] += amount;
        uint256 newBalance = balances[msg.sender][token];

        // 更新该代币的前三名存款者
        updateTopDepositors(token, msg.sender, newBalance);

        emit Deposited(token, msg.sender, amount);
    }

    /**
     * @dev 取款函数
     * @param token ERC20 代币合约地址
     * @param amount 取款数量
     */
    function withdraw(address token, uint256 amount) public virtual {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");

        // 更新余额
        balances[msg.sender][token] -= amount;

        // 转移代币给用户
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", msg.sender, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");

        // 更新前三名(余额减少后可能会影响排名)
        updateTopDepositors(token, msg.sender, balances[msg.sender][token]);

        emit Withdrawn(token, msg.sender, amount);
    }

    /**
     * @dev 更新指定代币的存款前三名
     * @param token 代币合约地址
     * @param user 用户地址
     * @param amount 用户当前总存款
     */
    function updateTopDepositors(address token, address user, uint256 amount) internal {
        address[3] storage depositors = topDepositors[token];
        uint256[3] storage amounts = topAmounts[token];

        // 先检查用户是否已经在前三名中
        int256 currentIndex = -1;
        for (uint256 i = 0; i < 3; i++) {
            if (depositors[i] == user) {
                currentIndex = int256(i);
                break;
            }
        }

        // 如果用户已在榜单中,先移除
        if (currentIndex >= 0) {
            uint256 idx = uint256(currentIndex);
            // 将后面的元素前移
            for (uint256 i = idx; i < 2; i++) {
                depositors[i] = depositors[i + 1];
                amounts[i] = amounts[i + 1];
            }
            // 清空最后一位
            depositors[2] = address(0);
            amounts[2] = 0;
        }

        // 找到新的插入位置
        uint256 insertPos = 3; // 默认不插入
        for (uint256 i = 0; i < 3; i++) {
            if (amount > amounts[i]) {
                insertPos = i;
                break;
            }
        }

        // 如果需要插入
        if (insertPos < 3) {
            // 将插入位置后的元素后移
            for (uint256 i = 2; i > insertPos; i--) {
                depositors[i] = depositors[i - 1];
                amounts[i] = amounts[i - 1];
            }
            // 插入新数据
            depositors[insertPos] = user;
            amounts[insertPos] = amount;
        }
    }

    /**
     * @dev 获取用户在指定代币的存款余额
     * @param token 代币合约地址
     * @param user 用户地址
     * @return 存款余额
     */
    function getBalance(address token, address user) public view returns (uint256) {
        return balances[user][token];
    }

    /**
     * @dev 获取指定代币的前三名存款者信息
     * @param token 代币合约地址
     * @return 前三名地址数组和对应金额数组
     */
    function getTopDepositors(address token)
        public
        view
        returns (address[3] memory, uint256[3] memory)
    {
        return (topDepositors[token], topAmounts[token]);
    }
}
