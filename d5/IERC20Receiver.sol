// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IERC20Receiver
 * @dev 接收 ERC20 代币转账的合约需要实现此接口
 * @dev 类似于 ERC721 的 onERC721Received 和 ERC1155 的 onERC1155Received
 */
interface IERC20Receiver {
    /**
     * @dev 当通过 transferWithCallback 接收代币时被调用
     * @param operator 发起转账的地址
     * @param from 代币发送方地址
     * @param amount 转账数量
     * @param data 附加数据
     * @return 必须返回 `bytes4(keccak256("tokensReceived(address,address,uint256,bytes)"))`
     *         即 0x0023de29,以确认代币接收
     */
    function tokensReceived(
        address operator,
        address from,
        uint256 amount,
        bytes calldata data
    ) external returns (bytes4);
}
