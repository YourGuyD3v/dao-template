const { network, ethers } = require("hardhat")
const { MINDELAY } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    chainId = network.config.chainId

    log("----------------------------------------------------")
    log("Deploying TimeLock....")

    const timeLock = await deploy("TimeLock", {
        from: deployer,
        args: [MINDELAY, [], [], deployer],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log(`TimeLock Deplyed at: ${timeLock.address}`)
}

module.exports.tags = ["all", "timelock"]