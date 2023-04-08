const { ethers } = require("hardhat")

async function main() {
    const priceFeedsAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    const priceFeed = await ethers.getContractAt("AggregatorV3Interface", priceFeedsAddress);
    const { answer } = await priceFeed.latestRoundData();
    console.log(answer.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })