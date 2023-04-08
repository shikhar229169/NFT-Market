const { ethers } = require("hardhat");

const networkData = {
    5: {
        name: "goerli",
        vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        mintFees: ethers.utils.parseEther("0.01"),
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subId: "8517",
        callbackGasLimit: "500000",
        priceFeedsAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },

    11155111: {
        name: "sepolia",
        vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        mintFees: ethers.utils.parseEther("0.01"),
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subId: "953",
        callbackGasLimit: "500000",
        priceFeedsAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },

    31337: {
        name: "hardhat",
        mintFees: ethers.utils.parseEther("0.01"),
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",  
    }
}

const doggieSelect = {
    0: {
        name: "valor", 
        symbol: "valo"
    },
    1: {
        name: "jacky",
        symbol: "jack",
    },
    2: {
        name: "fierce",
        symbol: "fire"
    }
}

const localNetworks = ["localhost", "hardhat"];

module.exports = { networkData, localNetworks };