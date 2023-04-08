const { network, ethers } = require("hardhat");
const { localNetworks, networkData } = require("../helper-hardhat-config.js")

module.exports = async({ deployments, getNamedAccounts }) => {
    if (localNetworks.includes(network.name)) {
        const { deploy, log } = deployments;
        const { deployer } = await getNamedAccounts();
        
        const BASE_FEE = ethers.utils.parseEther("0.25");
        const GAS_PRICE_LINK = "1000000000"; 

        const args = [BASE_FEE, GAS_PRICE_LINK];
        
        log("Deploying Mocks....");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args
        });
    }
}

module.exports.tags = ["mocks", "randomAll"];