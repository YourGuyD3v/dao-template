const MINDELAY = 3600;
const QUORUM_PERCENTAGE = 4
const VOTING_PERIOD = 5
const VOTING_DELAY = 1
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"
const NEW_STORE_VALUE = 77
const FUNC = "store"
const DESCRIPTION = "This is first proposal!"

const developmentChains = ["localhost", "hardhat"]
const proposalFile = "proposalFile.json"

module.exports = {
    MINDELAY,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
    ADDRESS_ZERO,
    NEW_STORE_VALUE,
    FUNC,
    DESCRIPTION,
    developmentChains,
    proposalFile
}