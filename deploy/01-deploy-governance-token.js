const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    chainId = network.config.chainId

    log("Deploying GovernanceToken....")
    const governancetoken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log(`Deployed at ${governancetoken.address}`)

    await delegate(governancetoken.address, deployer)
    log("Delegated!")
}

const delegate = async (governanceTokenAddress, delegatedAccount) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
    const transactionResponse = await governanceToken.delegate(delegatedAccount)
    await transactionResponse.wait(1)
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`)
}

module.exports.tags = ["all", "governor"]