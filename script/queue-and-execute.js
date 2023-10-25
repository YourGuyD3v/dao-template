const { ethers, network } = require("hardhat")
const { NEW_STORE_VALUE, FUNC, developmentChains, DESCRIPTION, MINDELAY } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move_blocks")
const { moveTime } = require("../utils/move_time")

async function queueAndExecute() {
    const args = [NEW_STORE_VALUE]
    const functionToCall = FUNC
    const box = await ethers.getContract("Box")
    const boxAddress = await box.getAddress()
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    const descriptionHash = ethers.id(DESCRIPTION)

    const governor = await ethers.getContract("GovernorContract")
    console.log("Queueing...")
    const queueTx = await governor.queue([boxAddress], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1)


    if (developmentChains.includes(network.name)) {
        await moveTime(MINDELAY + 1)
        await moveBlocks(1)
    }


    console.log("Executing...")
    const executeTx = await governor.execute([boxAddress], [0], [encodedFunctionCall], descriptionHash)
    await executeTx.wait(1)
    console.log(`Box value: ${await box.retrieve()}`)
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })