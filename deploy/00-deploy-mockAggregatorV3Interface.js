const { network } = require("hardhat");
const { localNetworks } = require("../helper-hardhat-config.js");

const DECIMAL = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = async ({ deployments, getNamedAccounts }) => {
    if (localNetworks.includes(network.name)) {
        const { deploy, log } = deployments;
        const { deployer } = await getNamedAccounts();

        log("Deploying Aggregator Mocks...");
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMAL, INITIAL_ANSWER],
            waitConfirmations: network.config.blockConfirmations || 1
        })
    }
}

module.exports.tags = ["dynamicNFT"];