const { network, ethers } = require("hardhat");
const { localNetworks, networkData } = require("../helper-hardhat-config.js");
const { storeImages, storeMetadata } = require("../utils/uploadToPinata.js");
const { verifyContract } = require("../utils/verify.js");

const FUND_AMT = ethers.utils.parseEther("1000");
const imagesFilePath = "./images/randomNFT/";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: {
        face: "ultra-cute",
        sound: "barks"
    }
}

module.exports = async({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let subId;
    let vrfCoordinator;
    const mintFees = networkData[chainId]["mintFees"];
    const keyHash = networkData[chainId]["keyHash"];
    const callbackGasLimit = networkData[chainId]["callbackGasLimit"];
    let VRFCoordinatorV2Mock;
    

    let dogieURIs;
    if (process.env.UPLOAD_TO_PINATA == "true") {
        dogieURIs = await getDogieURIs();
    }
    else {
        dogieURIs = [
            'ipfs://QmPLHzWRzUGgvrRo5Urg82PhmgyErezWTJRiogFBmxHKq2',
            'ipfs://QmbZaYUkPzZyGNFnKCCEENMt46Nn9ox4LLo31W7iXmK7ps',
            'ipfs://QmWM2aa6oMEtPasRDCbCu5KRvL6kurcc4s8Z1nXCN4jBFF'
        ];
    }

    if (localNetworks.includes(network.name)) {
        log("Local Network Detected...");
        VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        const subResponse = await VRFCoordinatorV2Mock.createSubscription();
        const receipt = await subResponse.wait(1);
        subId = receipt.events[0].args.subId;
        await VRFCoordinatorV2Mock.fundSubscription(subId, FUND_AMT);
        vrfCoordinator = VRFCoordinatorV2Mock.address;
    }
    else {
        vrfCoordinator = networkData[chainId]["vrfCoordinator"];
        subId = networkData[chainId]["subId"];
    }
    
    const args = [vrfCoordinator, mintFees, keyHash, subId, callbackGasLimit, dogieURIs];
    
    const randomNFT = await deploy("randomNFT", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1
    });
    
    if (localNetworks.includes(network.name)) {
        await VRFCoordinatorV2Mock.addConsumer(subId, randomNFT.address);
    }

    if (!localNetworks.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verifyContract(randomNFT.address, args);
    }
}
    
async function getDogieURIs() {
    // here the returned variable name is responses, but we want it to get stored in variable with other name
    const { responses: fileResponses, files } = await storeImages(imagesFilePath);
    
    const dogieURIs = [];
    // console.log(fileResponses);
    for (let idx in fileResponses) {
        const currMetadata = { ...metadataTemplate };
        const dogieName = files[idx].replace(".png", "");
        currMetadata.name = dogieName;
        currMetadata.description = `It's a cute and adorable ${dogieName}`;
        currMetadata.image = `ipfs://${fileResponses[idx].IpfsHash}`;

        // console.log(`Uploading for dogie- ${idx}`);
        const jsonResponse = await storeMetadata(currMetadata);
        dogieURIs.push(`ipfs://${jsonResponse.IpfsHash}`);
    }

    // console.log("Purrrr! Sucessfully Uploaded");
    // console.log(dogieURIs);
    return dogieURIs;
}

module.exports.tags = ["randomAll", "randomMain"];