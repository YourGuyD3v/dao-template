const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------------------")
    log("Deploying Box...")
    ARGUMENTS = []
    const box = await deploy("Box", {
        from: deployer,
        args: ARGUMENTS,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    const timelock = await ethers.getContract("TimeLock")
    const timeLockAddress = await timelock.getAddress()
    const boxContract = await ethers.getContractAt("Box", box.address)
    log("Tranfering Onwership...")
    const transferOwnerTx = await boxContract.transferOwnership(timeLockAddress)
    await transferOwnerTx.wait(1)
    log("Ownership tranfered!")
}

module.exports.tags = ["all", "box"]