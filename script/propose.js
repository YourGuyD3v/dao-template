const { ethers, network } = require("hardhat")
const { FUNC, NEW_STORE_VALUE, DESCRIPTION, VOTING_DELAY, developmentChains, proposalFile } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move_blocks")
const fs = require("fs-extra")

async function propose(args, functionToCall, ProposalDescription) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    const boxAddress = await box.getAddress()
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    console.log(`Proposing ${functionToCall} on ${boxAddress} with ${args}`)
    console.log(`Proposal Description \n ${ProposalDescription}`)
    const proposeTx = await governor.propose(
        [boxAddress],
        [0],
        [encodedFunctionCall],
        ProposalDescription
    )

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1)
    }

    const proposeReceipt = await proposeTx.wait(1)
    const log = governor.interface.parseLog(proposeReceipt.logs[0])
    const proposalId = log.args.proposalId
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)

    storeProposals(proposalId)

    // the Proposal State is an enum data type, defined in the IGovernor contract.
    // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)

}

function storeProposals(proposalId) {
    const chainId = network.config.chainId.toString()
    let proposals
    if (fs.existsSync(proposalFile)) {
        proposals = JSON.parse(fs.readFileSync(proposalFile, "utf8"))
    } else {
        proposals = {}
        proposals[chainId] = []
    }
    proposals[chainId].push(proposalId.toString())
    fs.writeFileSync(proposalFile, JSON.stringify(proposals), "utf8")
}

propose([NEW_STORE_VALUE], FUNC, DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })