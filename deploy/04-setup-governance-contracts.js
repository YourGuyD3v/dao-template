const { network, ethers } = require("hardhat")
const { ADDRESS_ZERO } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log } = deployments
    const { deployer } = await getNamedAccounts()
    chainId = network.config.chainId

    const governor = await ethers.getContract("GovernorContract")
    const timeLock = await ethers.getContract("TimeLock")
    const governorAddress = await governor.getAddress()

    log("----------------------------------------------------")
    log("Setting up for roles...")

    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

    const proposerTx = await timeLock.grantRole(proposerRole, governorAddress)
    await proposerTx.wait(1)
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
    await executorTx.wait(1)
    const revokeTx = await timeLock.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)

}

module.exports.tags = ["all", "setup"]