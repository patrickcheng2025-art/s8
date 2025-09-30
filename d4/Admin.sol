// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IBank.sol";

/**
 * @title Admin 合约
 * @notice 用于管理Bank合约的资金提取
 */
contract Admin {
    // Admin合约的所有者
    address public owner;

    // 事件：资金提取
    event FundsWithdrawn(address indexed bank, uint256 amount);

    // 事件：所有者转移
    event OwnerTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @notice 构造函数
     * @dev 部署者成为owner
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice modifier: 只有owner可以调用
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @notice 从Bank合约提取资金
     * @param bank IBank接口的合约地址
     * @dev 调用bank.withdraw()将资金转移到Admin合约地址
     */
    function adminWithdraw(IBank bank) external onlyOwner {
        // 记录提取前Admin合约的余额
        uint256 balanceBefore = address(this).balance;

        // 调用bank的withdraw函数，资金会转入Admin合约
        bank.withdraw();

        // 计算提取的金额
        uint256 balanceAfter = address(this).balance;
        uint256 withdrawnAmount = balanceAfter - balanceBefore;

        emit FundsWithdrawn(address(bank), withdrawnAmount);
    }

    /**
     * @notice 转移owner权限
     * @param newOwner 新owner地址
     */
    function transferOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner must be different from current owner");

        address previousOwner = owner;
        owner = newOwner;

        emit OwnerTransferred(previousOwner, newOwner);
    }

    /**
     * @notice 获取Admin合约的余额
     * @return Admin合约的ETH余额
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice 接收ETH
     * @dev 允许合约接收ETH转账
     */
    receive() external payable {}
}