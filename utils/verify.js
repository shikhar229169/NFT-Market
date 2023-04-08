const { run } = require("hardhat");

const verifyContract = async(contractAddress, args) => {
    try {
        console.log("Please wait while we verify your contract");
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        });
        console.log("verified! Purrrr");
    }
    catch(err) {
        if (err.toLowerCase().includes("already verified")) {
            console.log("Your contract is already verified!");
        }
        else {
            console.log(err);
        }
    }
}

module.exports = { verifyContract };