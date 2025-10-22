// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenBank.sol";
import "../d5/IERC20Receiver.sol";

/**
 * @title TokenBankV2
 * @dev 扩展的 TokenBank,支持通过 transferWithCallback 直接存款
 * @dev 实现了 IERC20Receiver 接口,可以接收带回调的代币转账
 */
contract TokenBankV2 is TokenBank, IERC20Receiver {
    // 额外事件:记录通过 callback 方式的存款
    event DepositedViaCallback(
        address indexed token,
        address indexed from,
        address indexed operator,
        uint256 amount,
        bytes data
    );

    /**
     * @dev 实现 IERC20Receiver 接口的 tokensReceived 函数
     * @dev 当用户通过 transferWithCallback 转账时,此函数会被自动调用
     * @param operator 发起转账的地址(通常是 from)
     * @param from 代币发送方地址
     * @param amount 转账数量
     * @param data 附加数据(可以用于传递额外信息)
     * @return 返回函数选择器以确认接收
     *
     * 工作流程:
     * 1. 用户调用 token.transferWithCallback(bankAddress, amount, data)
     * 2. ERC20WithCallback 合约先执行代币转账
     * 3. 检测到接收方是合约,调用本函数 tokensReceived
     * 4. 本函数记录存款信息,更新用户余额和排行榜
     * 5. 返回正确的函数选择器,确认接收成功
     */
    function tokensReceived(
        address operator,
        address from,
        uint256 amount,
        bytes calldata data
    ) external override returns (bytes4) {
        // msg.sender 是代币合约地址
        address token = msg.sender;

        require(token != address(0), "Invalid token address");
        require(amount > 0, "Deposit amount must be greater than 0");

        // 更新用户余额 - 注意这里使用 from(实际的代币发送者)
        balances[from][token] += amount;
        uint256 newBalance = balances[from][token];

        // 更新该代币的前三名存款者
        updateTopDepositors(token, from, newBalance);

        // 触发存款事件
        emit Deposited(token, from, amount);
        emit DepositedViaCallback(token, from, operator, amount, data);

        // 返回函数选择器,表示成功接收
        return this.tokensReceived.selector;
    }

    /**
     * @dev 重写 deposit 函数,保持原有的存款方式也可用
     * @dev 用户可以选择两种存款方式:
     *      1. 传统方式: approve + deposit(token, amount)
     *      2. 新方式: token.transferWithCallback(bankAddress, amount, data)
     */
    function deposit(address token, uint256 amount) public override {
        // 调用父合约的 deposit 实现
        super.deposit(token, amount);
    }

    /**
     * @dev 获取合约支持的存款方式说明
     * @return 支持的存款方式描述
     */
    function getSupportedDepositMethods() public pure returns (string memory) {
        return "Support two deposit methods: 1) approve + deposit(token, amount) 2) token.transferWithCallback(bankAddress, amount, data)";
    }
}
