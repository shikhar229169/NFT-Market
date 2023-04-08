const { network, ethers } = require("hardhat");
const { localNetworks, networkData } = require("../helper-hardhat-config.js");
const { getSVGImages } = require("../utils/handlingSVGImages.js");
const { verifyContract } = require("../utils/verify.js");
require("dotenv").config();

const imagesFilePath = "./images/dynamicNFT";

module.exports = async({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let priceFeedsAddress;

    if (localNetworks.includes(network.name)) {
        const priceFeedsInstance = await ethers.getContract("MockV3Aggregator");
        priceFeedsAddress = priceFeedsInstance.address;
    }
    else {
        priceFeedsAddress = networkData[chainId]["priceFeedsAddress"];
    }

    const svgImages = await getSVGImages(imagesFilePath);

    const args = [priceFeedsAddress, svgImages[1], svgImages[0]];

    const dynamicNFT = await deploy("dynamicNFT", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    const cc = await ethers.getContract("dynamicNFT", deployer);

    const sadURI = await cc.getSadURI();
    // console.log(sadURI.toString());

    if (!localNetworks.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verifyContract(dynamicNFT.address, args);
    }
}

module.exports.tags = ["dynamicNFT"];