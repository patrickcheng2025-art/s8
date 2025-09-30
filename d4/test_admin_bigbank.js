/**
 * BigBank 和 Admin 合约测试脚本
 *
 * 测试流程：
 * 1. 部署 BigBank 合约
 * 2. 部署 Admin 合约
 * 3. 将 BigBank 的管理员转移给 Admin 合约
 * 4. 模拟多个用户存款
 * 5. Admin 合约的 Owner 调用 adminWithdraw 提取资金
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("开始测试 BigBank 和 Admin 合约...\n");

    // 获取签名者账户
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();

    console.log("账户信息：");
    console.log("Owner地址:", owner.address);
    console.log("User1地址:", user1.address);
    console.log("User2地址:", user2.address);
    console.log("User3地址:", user3.address);
    console.log("User4地址:", user4.address);
    console.log("\n" + "=".repeat(80) + "\n");

    // 1. 部署 BigBank 合约
    console.log("步骤1: 部署 BigBank 合约...");
    const BigBank = await ethers.getContractFactory("BigBank");
    const bigBank = await BigBank.deploy();
    await bigBank.waitForDeployment();
    const bigBankAddress = await bigBank.getAddress();
    console.log("✓ BigBank 合约地址:", bigBankAddress);
    console.log("✓ BigBank 初始 owner:", await bigBank.owner());
    console.log("✓ BigBank 初始 admin:", await bigBank.admin());
    console.log("\n" + "=".repeat(80) + "\n");

    // 2. 部署 Admin 合约
    console.log("步骤2: 部署 Admin 合约...");
    const Admin = await ethers.getContractFactory("Admin");
    const admin = await Admin.deploy();
    await admin.waitForDeployment();
    const adminAddress = await admin.getAddress();
    console.log("✓ Admin 合约地址:", adminAddress);
    console.log("✓ Admin owner:", await admin.owner());
    console.log("\n" + "=".repeat(80) + "\n");

    // 3. 将 BigBank 的管理员转移给 Admin 合约
    console.log("步骤3: 转移 BigBank 管理员权限给 Admin 合约...");
    const transferTx = await bigBank.transferAdmin(adminAddress);
    await transferTx.wait();
    console.log("✓ 管理员已转移");
    console.log("✓ BigBank 新 admin:", await bigBank.admin());
    console.log("\n" + "=".repeat(80) + "\n");

    // 4. 模拟多个用户存款
    console.log("步骤4: 模拟用户存款...");

    // User1 存款 0.5 ETH
    console.log("\n→ User1 存款 0.5 ETH...");
    let tx = await bigBank.connect(user1).deposit({ value: ethers.parseEther("0.5") });
    await tx.wait();
    console.log("✓ User1 存款成功");
    console.log("  User1 余额:", ethers.formatEther(await bigBank.balances(user1.address)), "ETH");

    // User2 存款 1.0 ETH
    console.log("\n→ User2 存款 1.0 ETH...");
    tx = await bigBank.connect(user2).deposit({ value: ethers.parseEther("1.0") });
    await tx.wait();
    console.log("✓ User2 存款成功");
    console.log("  User2 余额:", ethers.formatEther(await bigBank.balances(user2.address)), "ETH");

    // User3 存款 0.8 ETH
    console.log("\n→ User3 存款 0.8 ETH...");
    tx = await bigBank.connect(user3).deposit({ value: ethers.parseEther("0.8") });
    await tx.wait();
    console.log("✓ User3 存款成功");
    console.log("  User3 余额:", ethers.formatEther(await bigBank.balances(user3.address)), "ETH");

    // User4 存款 0.3 ETH
    console.log("\n→ User4 存款 0.3 ETH...");
    tx = await bigBank.connect(user4).deposit({ value: ethers.parseEther("0.3") });
    await tx.wait();
    console.log("✓ User4 存款成功");
    console.log("  User4 余额:", ethers.formatEther(await bigBank.balances(user4.address)), "ETH");

    // 获取合约总余额
    const totalBalance = await bigBank.getContractBalance();
    console.log("\n✓ BigBank 合约总余额:", ethers.formatEther(totalBalance), "ETH");

    // 获取前三名存款者
    const [topAddresses, topAmounts] = await bigBank.getTopDepositors();
    console.log("\n前三名存款者：");
    for (let i = 0; i < 3; i++) {
        if (topAddresses[i] !== ethers.ZeroAddress) {
            console.log(`  ${i + 1}. ${topAddresses[i]}: ${ethers.formatEther(topAmounts[i])} ETH`);
        }
    }
    console.log("\n" + "=".repeat(80) + "\n");

    // 5. Admin 合约的 Owner 调用 adminWithdraw 提取资金
    console.log("步骤5: Admin Owner 提取 BigBank 资金...");

    // 提取前的余额
    const adminBalanceBefore = await ethers.provider.getBalance(adminAddress);
    console.log("Admin 合约提取前余额:", ethers.formatEther(adminBalanceBefore), "ETH");
    console.log("BigBank 提取前余额:", ethers.formatEther(await bigBank.getContractBalance()), "ETH");

    // 调用 adminWithdraw
    console.log("\n→ 调用 adminWithdraw...");
    const withdrawTx = await admin.adminWithdraw(bigBankAddress);
    const receipt = await withdrawTx.wait();

    // 提取后的余额
    const adminBalanceAfter = await ethers.provider.getBalance(adminAddress);
    const bigBankBalanceAfter = await bigBank.getContractBalance();

    console.log("✓ 提取成功！");
    console.log("\nAdmin 合约提取后余额:", ethers.formatEther(adminBalanceAfter), "ETH");
    console.log("BigBank 提取后余额:", ethers.formatEther(bigBankBalanceAfter), "ETH");
    console.log("提取金额:", ethers.formatEther(adminBalanceAfter - adminBalanceBefore), "ETH");

    console.log("\n" + "=".repeat(80) + "\n");
    console.log("✓ 测试完成！所有资金已从 BigBank 转移到 Admin 合约");

    // 测试：尝试用非owner地址调用（应该失败）
    console.log("\n" + "=".repeat(80) + "\n");
    console.log("额外测试: 尝试用非owner地址调用 adminWithdraw（预期失败）...");
    try {
        await admin.connect(user1).adminWithdraw(bigBankAddress);
        console.log("✗ 错误：非owner竟然可以调用！");
    } catch (error) {
        console.log("✓ 正确：非owner无法调用 adminWithdraw");
    }

    // 测试：尝试存款少于0.001 ETH（应该失败）
    console.log("\n额外测试: 尝试存款 0.0001 ETH（预期失败）...");
    try {
        await bigBank.connect(user1).deposit({ value: ethers.parseEther("0.0001") });
        console.log("✗ 错误：少于0.001 ETH竟然可以存款！");
    } catch (error) {
        console.log("✓ 正确：少于0.001 ETH 无法存款");
    }

    console.log("\n" + "=".repeat(80) + "\n");
    console.log("所有测试完成！");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });