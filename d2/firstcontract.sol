// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;


contract Counter {
    // 状态变量 counter
    uint256 public counter;

    // 构造函数，初始化 counter 为 0
    constructor() {
        counter = 0;
    }

    // 获取 counter 的值
    function get() public view returns (uint256) {
        return counter;
    }

    // 给 counter 加上 x
    function add(uint256 x) public {
        counter += x;
    }
}
