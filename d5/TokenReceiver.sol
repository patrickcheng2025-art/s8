// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20Receiver.sol";

/**
 * @title TokenReceiver
 * @dev 示例接收合约,实现了 IERC20Receiver 接口
 * @dev 演示如何正确接收带回调的代币转账
 */
contract TokenReceiver is IERC20Receiver {
    // 记录接收到的转账信息
    struct ReceivedToken {
        address operator;   // 操作者地址
        address from;       // 发送方地址
        uint256 amount;     // 转账数量
        bytes data;         // 附加数据
        uint256 timestamp;  // 接收时间
    }

    // 存储所有接收记录
    ReceivedToken[] public receivedTokens;

    // 事件:记录代币接收
    event TokensReceivedEvent(
        address indexed operator,
        address indexed from,
        uint256 amount,
        bytes data,
        uint256 timestamp
    );

    /**
     * @dev 实现 IERC20Receiver 接口的 tokensReceived 函数
     * @param operator 发起转账的地址
     * @param from 代币发送方地址
     * @param amount 转账数量
     * @param data 附加数据
     * @return 返回函数选择器以确认接收
     */
    function tokensReceived(
        address operator,
        address from,
        uint256 amount,
        bytes calldata data
    ) external override returns (bytes4) {
        // 记录接收信息
        receivedTokens.push(
            ReceivedToken({
                operator: operator,
                from: from,
                amount: amount,
                data: data,
                timestamp: block.timestamp
            })
        );

        // 触发事件
        emit TokensReceivedEvent(operator, from, amount, data, block.timestamp);

        // 返回函数选择器,表示成功接收
        return this.tokensReceived.selector;
    }

    /**
     * @dev 获取接收记录总数
     * @return 接收记录的数量
     */
    function getReceivedCount() public view returns (uint256) {
        return receivedTokens.length;
    }

    /**
     * @dev 获取指定索引的接收记录
     * @param index 记录索引
     * @return operator 操作者地址
     * @return from 发送方地址
     * @return amount 转账数量
     * @return data 附加数据
     * @return timestamp 接收时间
     */
    function getReceivedToken(uint256 index)
        public
        view
        returns (
            address operator,
            address from,
            uint256 amount,
            bytes memory data,
            uint256 timestamp
        )
    {
        require(index < receivedTokens.length, "TokenReceiver: index out of bounds");
        ReceivedToken memory token = receivedTokens[index];
        return (token.operator, token.from, token.amount, token.data, token.timestamp);
    }
}

/**
 * @title BadTokenReceiver
 * @dev 错误的接收合约示例,未实现 IERC20Receiver 接口
 * @dev 用于测试当接收方未正确实现接口时的行为
 */
contract BadTokenReceiver {
    // 这个合约没有实现 IERC20Receiver 接口
    // 当使用 transferWithCallback 向此合约转账时会失败

    // 简单的接收代币函数(但不符合接口要求)
    function receiveTokens() public pure returns (string memory) {
        return "This contract cannot receive tokens via transferWithCallback";
    }
}
