const { ethers, network, deployments, getNamedAccounts } = require("hardhat");
const { localNetworks, networkData } = require("../../helper-hardhat-config.js");
const { assert, expect } = require("chai");
const { getSVGImagesURI } = require("../../utils/handlingSVGImages.js");

const imagesFilePath = "./images/dynamicNFT";

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Contract Testing", () => {
        let dynamicNFT;
        let aggregatorV3Interface;
        let chainId;
        let deployer;

        beforeEach(async() => {
            await deployments.fixture(["dynamicNFT"]);
            deployer = (await getNamedAccounts()).deployer;

            dynamicNFT = await ethers.getContract("dynamicNFT");
            aggregatorV3Interface = await ethers.getContract("MockV3Aggregator");
            chainId = network.config.chainId;
        })

        describe("Constructor Testing", () => {
            it("AggregatorV3 Address is set up correctly", async() => {
                const receivedAddress = await dynamicNFT.getPriceFeedsAddress();
                const actualAddress = aggregatorV3Interface.address;

                assert.equal(receivedAddress, actualAddress);
            });

            it("URI for cats NFT is set up Correctly", async() => {
                const actualURIs = await getSVGImagesURI(imagesFilePath);
                const sadURI = `data:image/svg+xml;base64,${actualURIs[1]}`;
                const happyURI = `data:image/svg+xml;base64,${actualURIs[0]}`;

                const receivedSadURI = await dynamicNFT.getSadURI();
                const receivedHappyURI = await dynamicNFT.getHappyURI();

                assert.equal(sadURI, receivedSadURI);
                assert.equal(happyURI, receivedHappyURI);
            })
        });

        describe("Mint NFT Function Testing", () => {
            const highValue = "945656";
            it("NFT minted for requester, balance increased, tokenCounter incremented and high Value is set correctly", async() => {
                const initialTokenCounter = await dynamicNFT.getTokenCounter();
                const initialBalance = await dynamicNFT.balanceOf(deployer);

                const response = await dynamicNFT.mintNFT(highValue);
                await response.wait(1);

                const finalTokenCounter = await dynamicNFT.getTokenCounter();
                const owner = await dynamicNFT.ownerOf(initialTokenCounter);
                const finalBalance = await dynamicNFT.balanceOf(deployer);
                const receivedHighValue = await dynamicNFT.highPriceOf(initialTokenCounter);

                assert.equal(owner, deployer);
                assert.equal(finalTokenCounter.toString(), initialTokenCounter.add(1).toString());
                assert.equal(finalBalance.toString(), initialBalance.add(1).toString());
                assert.equal(highValue, receivedHighValue);
            });

            it("Event is emitted when NFT is minted", async() => {
                await expect(dynamicNFT.mintNFT(highValue)).to.emit(dynamicNFT, "NFTMinted");
            })
        })

        describe("Change High Price Function Testing", () => {
            it("Reverts if caller is not the owner", async() => {
                const tokenId = await dynamicNFT.getTokenCounter();
                const response = await dynamicNFT.mintNFT("945656");
                await response.wait(1);

                const accounts = await ethers.getSigners();
                const attacker = await dynamicNFT.connect(accounts[1]);

                await expect(attacker.changeHighPrice(tokenId, "1")).to.be.revertedWith("dynamicNFT__notOwner");
            });

            it("Changes if owner calls", async() => {
                const tokenId = await dynamicNFT.getTokenCounter();
                const response = await dynamicNFT.mintNFT("945656");
                await response.wait(1);

                const newHighPrice = "1234";
                const changeResponse = await dynamicNFT.changeHighPrice(tokenId, newHighPrice);
                await changeResponse.wait(1);

                const receivedNewHighPrice = await dynamicNFT.highPriceOf(tokenId);

                assert.equal(newHighPrice, receivedNewHighPrice);
            })
        })

        describe("Token URI Function Testing", () => {
            it("Reverts if NFT is not minted for a tokenId", async() => {
                const tokenId = 343;   // A random number
                await expect(dynamicNFT.tokenURI(tokenId)).to.be.revertedWith("dynamicNFT__tokenNotFound");
            })

            it("NFT URI is set according to the price feeds", async() => {
                const { answer } = await aggregatorV3Interface.callStatic.latestRoundData();

                const tokenId = await dynamicNFT.getTokenCounter();
                // mint NFT 
                // let us set the high value same as the price from latest round data
                const mintResponse = await dynamicNFT.mintNFT(answer.add(1));
                await mintResponse.wait(1);

                const JSON_URI = await dynamicNFT.tokenURI(tokenId);

                const userHighPrice = await dynamicNFT.highPriceOf(tokenId);
                let imageURI;
                let nameOfNFT;
                if (answer >= userHighPrice) {
                    imageURI = await dynamicNFT.getHappyURI();
                    nameOfNFT = "Happy happy happy";
                }
                else {
                    imageURI = await dynamicNFT.getSadURI();
                    nameOfNFT = "Sed Life";
                }

                const correctJSON_URI = {
                    name: nameOfNFT,
                    description: "A dynamic SVG NFT, changes with the change in price feeds",
                    image: imageURI
                }

                let objJsonStr = JSON.stringify(correctJSON_URI);
                let objJsonB64 = `data:application/json;base64,${Buffer.from(objJsonStr).toString("base64")}`;
                
                assert.equal(JSON_URI.toString(), objJsonB64,toString());
            })
        })

    });