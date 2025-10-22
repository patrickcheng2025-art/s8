// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20Receiver.sol";

/**
 * @title ERC20WithCallback
 * @dev 扩展的 ERC20 代币合约,支持转账时调用接收方的回调函数
 */
contract ERC20WithCallback {
    // 代币名称
    string public name;
    // 代币符号
    string public symbol;
    // 小数位数
    uint8 public decimals;
    // 总供应量
    uint256 public totalSupply;

    // 余额映射
    mapping(address => uint256) public balanceOf;
    // 授权映射
    mapping(address => mapping(address => uint256)) public allowance;

    // 事件定义
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TransferWithCallback(address indexed from, address indexed to, uint256 value, bytes data);

    /**
     * @dev 构造函数
     * @param _name 代币名称
     * @param _symbol 代币符号
     * @param _decimals 小数位数
     * @param _totalSupply 初始总供应量
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    /**
     * @dev 标准转账函数
     * @param to 接收地址
     * @param value 转账数量
     * @return 转账是否成功
     */
    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[msg.sender] >= value, "ERC20: insufficient balance");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev 授权转账函数
     * @param from 发送地址
     * @param to 接收地址
     * @param value 转账数量
     * @return 转账是否成功
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool) {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[from] >= value, "ERC20: insufficient balance");
        require(allowance[from][msg.sender] >= value, "ERC20: insufficient allowance");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    /**
     * @dev 授权函数
     * @param spender 被授权地址
     * @param value 授权数量
     * @return 授权是否成功
     */
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev 带回调的转账函数
     * @param to 接收地址
     * @param value 转账数量
     * @param data 传递给回调函数的附加数据
     * @return 转账是否成功
     *
     * 功能说明:
     * 1. 执行标准的代币转账
     * 2. 如果接收地址是合约地址,则调用其 tokensReceived 回调函数
     * 3. 验证回调函数的返回值,确保接收方正确实现了接口
     */
    function transferWithCallback(
        address to,
        uint256 value,
        bytes memory data
    ) public returns (bool) {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[msg.sender] >= value, "ERC20: insufficient balance");

        // 执行转账
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        emit TransferWithCallback(msg.sender, to, value, data);

        // 检查接收地址是否为合约
        if (isContract(to)) {
            // 调用接收方的 tokensReceived 回调函数
            bytes4 retval = IERC20Receiver(to).tokensReceived(
                msg.sender,
                msg.sender,
                value,
                data
            );

            // 验证返回值是否正确
            require(
                retval == IERC20Receiver.tokensReceived.selector,
                "ERC20: transfer to non-ERC20Receiver implementer"
            );
        }

        return true;
    }

    /**
     * @dev 检查地址是否为合约
     * @param account 要检查的地址
     * @return 如果是合约返回 true,否则返回 false
     */
    function isContract(address account) internal view returns (bool) {
        // 获取地址的代码大小
        // 外部账户(EOA)的代码大小为 0
        // 合约账户的代码大小大于 0
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}
