const { network, ethers, deployments } = require("hardhat")
const { developmentChains, FUNC, NEW_STORE_VALUE, DESCRIPTION, VOTING_DELAY, MINDELAY, VOTING_PERIOD } = require("../../helper-hardhat-config")
const { expect, assert } = require("chai")
const { moveBlocks } = require("../../utils/move_blocks")
const { moveTime } = require("../../utils/move_time")

!developmentChains.includes(network.name) ? Skip.describe
    : describe("Dao unit testing", function () {
        let governor, governanceToken, timeLock, box
        const voteWay = 1
        const reason = "I like to move it!"

        beforeEach(async () => {
            votter = await ethers.getSigners()
            await deployments.fixture(["all"])

            governor = await ethers.getContract("GovernorContract")
            governanceToken = await ethers.getContract("GovernanceToken")
            timeLock = await ethers.getContract("TimeLock")
            box = await ethers.getContract("Box")
        })

        it("can only be changed through governance", async () => {
            await expect(box.store(33)).to.be.revertedWith("Ownable: caller is not the owner")
        })

        it("proposes, votes, waits, queues, and then executes", async () => {
            // propose
            const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [NEW_STORE_VALUE])
            const boxAddress = await box.getAddress()
            const proposeTx = await governor.propose(
                [boxAddress],
                [0],
                [encodedFunctionCall],
                DESCRIPTION
            )
            const proposeReceipt = await proposeTx.wait(1)
            const log = governor.interface.parseLog(proposeReceipt.logs[0])
            const proposalId = log.args.proposalId
            let state = await governor.state(proposalId)
            console.log(`Current Proposal State: ${state}`)
            await moveBlocks(VOTING_DELAY + 1)

            // vote
            const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
            await voteTx.wait(1)
            state = await governor.state(proposalId)
            assert.equal(state.toString(), 1)
            console.log(`Current Proposal State: ${state}`)
            await moveBlocks(VOTING_PERIOD + 1)

            // Queue & Execute
            const descriptionHash = ethers.id(DESCRIPTION)
            const queueTx = await governor.queue(
                [boxAddress],
                [0],
                [encodedFunctionCall],
                descriptionHash
            )
            await queueTx.wait(1)
            await moveTime(MINDELAY + 1)
            await moveBlocks(1)
            state = await governor.state(proposalId)
            console.log(`Current Proposal State: ${state}`)

            console.log("Executing...")
            const executeTx = await governor.execute(
                [boxAddress],
                [0],
                [encodedFunctionCall],
                descriptionHash
            )
            await executeTx.wait(1)
            state = await governor.state(proposalId)
            console.log(`Current Proposal State: ${state}`)
            console.log(`store number: ${await box.retrieve()}`)
        })
    }) 