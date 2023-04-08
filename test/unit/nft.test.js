const { ethers, network, getNamedAccounts, deployments } = require("hardhat");
const { localNetworks } = require("../../helper-hardhat-config.js");
const { assert, expect } = require("chai");

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("Tests for My NFT", () => {
        let myNFT;
        let deployer;
        
        beforeEach(async () => {
            await deployments.fixture(["all"]);
            deployer = (await getNamedAccounts()).deployer;
            myNFT = await ethers.getContract("NFT", deployer);
        });

        describe("Constructor Tests", async() => {
            it("Token Name and Symbol are correctly Set Up", async() => {
                const name = await myNFT.name();
                const symbol = await myNFT.symbol();

                assert.equal(name, "Doggieeeee");
                assert.equal(symbol, "BOB");
            });

            it("Token Counter is initialized to zero", async() => {
                const tokenCounter = await myNFT.getTokenCount();
                assert.equal(tokenCounter.toString(), "0");
            })
        });

        describe("Token URI Function", () => {
            it("Returns correct URI", async() => {
                const tokenURI = await myNFT.tokenURI(0);
            assert.equal(tokenURI, "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json");
            });
            
        });

        describe("Mint NFT Functions", () => {
            // This function will never get reverted as each time a unique tokenId is passed

            it("NFT Minted for the caller and is added in _owners", async() => {
                const currToken = await myNFT.getTokenCount();
                const initialTokenBalance = await myNFT.balanceOf(deployer);

                const mintResponse = await myNFT.mintNFT();
                await mintResponse.wait(1);

                const finalTokenCounter = await myNFT.getTokenCount();
                const finalTokenBalance = await myNFT.balanceOf(deployer);
                const owner = await myNFT.ownerOf(currToken);

                assert.equal(initialTokenBalance.add(1).toString(), finalTokenBalance.toString());
                assert.equal(currToken.add(1).toString(), finalTokenCounter.toString());
                assert.equal(owner, deployer);
            });

            it("Event is emitted after successful mint", async() => {
                await expect(myNFT.mintNFT()).to.emit(myNFT, "Transfer");
            });
        });
    });