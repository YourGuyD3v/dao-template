const { network } = require("hardhat")

async function moveBlocks(number) {
    console.log("Moving blocks...")
    for (let i = 0; i < number; i++) {
        await network.provider.request({
            method: "evm_mine",
            params: []
        })
    }
}

module.exports = {
    moveBlocks,
}