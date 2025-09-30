// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IBank 接口
 * @notice Bank合约的标准接口定义
 */
interface IBank {
    // 事件声明
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    /**
     * @notice 存款函数
     * @dev 接收ETH并记录存款金额
     */
    function deposit() external payable;

    /**
     * @notice 提取函数
     * @dev 管理员提取合约中的所有ETH
     */
    function withdraw() external;

    /**
     * @notice 获取合约当前总余额
     * @return 合约的ETH余额
     */
    function getContractBalance() external view returns (uint256);

    /**
     * @notice 获取前三名存款者信息
     * @return 前三名地址数组和对应金额数组
     */
    function getTopDepositors() external view returns (address[3] memory, uint256[3] memory);
}