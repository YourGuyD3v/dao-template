const fs = require("fs-extra")
const { proposalFile, developmentChains, VOTING_PERIOD } = require("../helper-hardhat-config")
const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move_blocks")

async function main() {
    const proposals = JSON.parse(fs.readFileSync(proposalFile, "utf8"))
    const proposalId = proposals[network.config.chainId].at(-1)
    const voteWay = 1
    const reason = "I lika to move it"
    await vote(proposalId, voteWay, reason)
}

async function vote(proposalId, voteWay, reason) {
    console.log("Voting...")
    const governor = await ethers.getContract("GovernorContract")

    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await voteTx.wait(1)
    const proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error)
    process.exit(1)
})