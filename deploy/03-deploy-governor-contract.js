const { network, ethers } = require("hardhat")
const { QUORUM_PERCENTAGE, VOTING_PERIOD, VOTING_DELAY } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    chainId = network.config.chainId
    const governanceToken = await get("GovernanceToken")
    const timeLock = await get("TimeLock")

    const args = [
        governanceToken.address,
        timeLock.address,
        VOTING_DELAY,
        VOTING_PERIOD,
        QUORUM_PERCENTAGE,
    ]

    log("----------------------------------------------------")
    log("Deploying GovernorContract and waiting for confirmations...")

    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`GovernorContract deployed at: ${governorContract.address}`)
}

module.exports.tags = ["all", "governorcontract"]