'''
• 通过 Metamask 向Bank合约存款（转账ETH）
• 在Bank合约记录每个地址存款金额
• 用数组记录存款金额前 3 名
• 编写 Bank合约 withdraw(), 实现只有管理员提取出所有的 ETH
'''


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Bank {
    // 管理员地址
    address public immutable owner;

    // 记录每个地址的存款金额
    mapping(address => uint256) public balances;

    // 存款前3名的地址和金额
    address[3] public topDepositors;
    uint256[3] public topAmounts;

    // 事件声明
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    // 构造函数，设置部署者为管理员
    constructor() {
        owner = msg.sender;
    }

    //  modifier 检查是否为管理员
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // 存款函数，接收ETH并更新记录
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        // 更新余额
        balances[msg.sender] += msg.value;
        uint256 newBalance = balances[msg.sender];

        // 更新前三名记录
        updateTopDepositors(msg.sender, newBalance);

        emit Deposited(msg.sender, msg.value);
    }


    // 更新存款前三名
    function updateTopDepositors(address user, uint256 amount) private {
        // 检查是否能进入前三名
        bool inserted = false;

        // 从后往前检查，找到合适的位置
        for (uint256 i = 2; i >= 0; i--) {
            if (amount > topAmounts[i]) {
                // 如果不是最后一位，需要向后移动
                if (i < 2) {
                    topDepositors[i+1] = topDepositors[i];
                    topAmounts[i+1] = topAmounts[i];
                    if(i==0) {
                        // insert 
                        topDepositors[i] = user;
                        topAmounts[i] = amount;
                        inserted = true;
                    }
                }
            }  
            
            else {
              if(i<2) {
                topDepositors[i+1] = user;
                topAmounts[i+1] = amount;
                inserted = true;
              }
            }
            if (inserted) 
                break;
        }
    }

    // 管理员提取所有ETH
    function withdraw() external onlyOwner {
        // 查询合约账户中当前有多少 ETH，即所有用户存入的 ETH 总和。
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // 发送所有余额给管理员
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(owner, balance);
    }

    // 获取合约当前总余额
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // 获取前三名存款者信息
    function getTopDepositors() external view returns (address[3] memory, uint256[3] memory) {
        return (topDepositors, topAmounts);
    }

    // 接收ETH的fallback函数
    //当有人直接向合约地址转账 ETH（不调用任何函数）时，这个函数会自动执行。 作用： 自动调用 deposit() 函数，将转账记录到发送者的余额中。
    
    receive() external payable {
        deposit();
    }
}
