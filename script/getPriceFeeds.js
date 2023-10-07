const { ethers, getNamedAccounts } = require("hardhat")
const util = require("util")
require("dotenv").config()

async function main() {
    // const priceFeedsAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    // const priceFeed = await ethers.getContractAt("AggregatorV3Interface", priceFeedsAddress);
    // const { answer } = await priceFeed.latestRoundData();
    // console.log(answer.toString());

    // const { deployer } = await getNamedAccounts()
    // console.log("Deployer - ", deployer);
    // console.log(await ethers.getSigner(deployer));
    // const accounts = await ethers.getSigners()
    // console.log();
    // console.log(accounts[0]);


    const provider = new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const signer = wallet.connect(provider);
    const formattedObject = util.inspect(signer, { depth: 100 });
 
    console.log(typeof signer);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })