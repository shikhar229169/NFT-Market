const { network } = require("hardhat");
const { localNetworks, networkData } = require("../helper-hardhat-config.js");
const { verifyContract } = require("../utils/verify.js");
require("dotenv").config();

module.exports = async( { deployments, getNamedAccounts } ) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let tokenName;
    let tokenSymbol;

    if (localNetworks.includes(network.name)) {
        tokenName = "Doggieeeee";
        tokenSymbol = "BOB";
    }
    else {
        tokenName =  networkData[chainId]["tokenName"];
        tokenSymbol =  networkData[chainId]["tokenSymbol"];
    }

    const args = [tokenName, tokenSymbol];

    log("Deploying NFT Contract...");

    const myNFT = await deploy("NFT", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    log("Successfully Deployed! Pur-rrrrrr");


    if (!localNetworks.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verifyContract(myNFT.address, args);
    }
}

module.exports.tags = ["all"];