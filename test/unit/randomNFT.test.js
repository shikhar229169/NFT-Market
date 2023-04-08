const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { localNetworks, networkData } = require("../../helper-hardhat-config.js");
const { assert, expect } = require("chai");

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Testing", () => {
        let randomNFT;
        let deployer;
        let vrfCoordinatorMock;
        let chainId;
        let mintFees;

        beforeEach(async() => {
            await deployments.fixture(["randomAll"]);
            deployer = (await getNamedAccounts()).deployer;

            randomNFT = await ethers.getContract("randomNFT", deployer);
            vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            chainId = network.config.chainId;
            mintFees = await randomNFT.getMintFees();
        });

        describe("Constructor Testing", () => {
            it("Coordinator, TokenCounter, owner and mintFees are set up correctly", async() => {
                const vrfCoordinatorAddress = await randomNFT.vrfCoordinator();
                const tokenCounter = await randomNFT.getTokenCounter();
                const mintFeesRequired = networkData[chainId]["mintFees"];
                const owner = await randomNFT.getOwner();
                
                assert.equal(vrfCoordinatorAddress, vrfCoordinatorMock.address);
                assert.equal(tokenCounter.toString(), "0");
                assert.equal(deployer, owner);
                assert.equal(mintFees.toString(), mintFeesRequired.toString());
            });
        });

        describe("Get Breeds Function", () => {
            // 0 signifies Pug
            // 1 signifies Shiba
            // 2 signifies Bernard
            it("Returns Pug for 0 to 9", async() => {
                for (let i=0; i<=9; i++) {
                    const breed = await randomNFT.getBreed(i);
                    assert.equal(breed.toString(), "0");
                }
            });

            it("Returns Shiba for 10 to 49", async() => {
                for (let i=10; i<=49; i++) {
                    const breed = await randomNFT.getBreed(i);
                    assert.equal(breed.toString(), "1");
                }
            });

            it("Returns Bernard for 50 to 99", async() => {
                for (let i=50; i<=99; i++) {
                    const breed = await randomNFT.getBreed(i);
                    assert.equal(breed.toString(), "2");
                }
            });

            it("Reverts if the Number provided is out of MAX Modulo Range", async() => {
               await expect(randomNFT.getBreed(100)).to.be.revertedWith("randomNFT__breedNotFound");
            });
        });

        describe("Request Dogie Token Function Testing", () => {
            it("Reverts if less ETH sent for minting", async() => {
                await expect(randomNFT.requestDoggieToken({ value: 0 })).to.be.revertedWith("randomNFT__lessMintFees");
            })

            it("Passes for correct amount of ETH sent", async() => {
                await expect(randomNFT.requestDoggieToken({ value: mintFees })).not.to.be.reverted;
            })

            it("Request Id is Generated", async() => {
                const response = await randomNFT.requestDoggieToken({ value: mintFees });
                const receipt = await response.wait(1);
                
                assert.equal(receipt.events[1].args.reqId.toString(), "1");
            })

            it("NFT Request Event is emitted upon generation of request Id", async() => {
                await expect(randomNFT.requestDoggieToken({ value: mintFees })).to.emit(randomNFT, "NFTRequested");
            })

            it("The NFT Requester's address is assigned in mapping corresponding to the request Id generated", async() => {
                const response = await randomNFT.requestDoggieToken({ value: mintFees });
                const receipt = await response.wait(1);

                const requestId = receipt.events[1].args.reqId.toString();
                const NFTRequester = await randomNFT.getSender(requestId);

                assert.equal(deployer, NFTRequester);
            })
        });

        describe("Fulfill Random Words Function Testing", () => {
            it("Everything Happens Man, I am tired", async() => {
                let initialTokenCounter;
                let initialTokensOfOwner = await randomNFT.balanceOf(deployer);
                let reqId;

                await new Promise(async function(resolve, reject)  {
                    randomNFT.once("NFTMinted", async function() {
                        const finalTokenCounter = await randomNFT.getTokenCounter();
                        const finalTokensOfOwner = await randomNFT.balanceOf(deployer);
                        const owner = await randomNFT.ownerOf(initialTokenCounter);
                        const URI = await randomNFT.tokenURI(initialTokenCounter);
                        
                        assert.equal(finalTokenCounter.toString(), initialTokenCounter.add(1).toString());
                        assert.equal(finalTokensOfOwner.toString(), initialTokensOfOwner.add(1).toString());
                        assert.equal(owner, deployer);
                        console.log(URI);      
                        resolve();             
                    })

                    initialTokenCounter = await randomNFT.getTokenCounter();
                    const response = await randomNFT.requestDoggieToken({ value: mintFees });
                    const receipt = await response.wait(1);
                    reqId = receipt.events[1].args.reqId;
                    
                    const response1 = await vrfCoordinatorMock.fulfillRandomWords(reqId, randomNFT.address);
                    const r2 = await response1.wait(1);
                    // console.log(r2);
                });

            });
        });

        describe("Withdraw Function Testing", () => {
            it ("Reverts if anyone other calls other than Owner", async() => {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1];
                const attackerInstance = await randomNFT.connect(attacker);

                await expect(attackerInstance.withdraw()).to.be.revertedWith("randomNFT__notOwner");
            });

            it("Reverts if eth amount is 0 (owner calls)", async() => {
                await expect(randomNFT.withdraw()).to.be.revertedWith("randomNFT__zeroBalance");
            });
        });

        describe("Change Callback Gas Limit Function", () => {
            it("reverts if caller is not the owner", async() => {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1];
                const attackerInstance = await randomNFT.connect(attacker);

                await expect(attackerInstance.changeCallbackGasLimit(22)).to.be.revertedWith("randomNFT__notOwner");
            })

            it("Callback Gas Limit is updated correctly if owner calls", async() => {
                const ourUpdate = 100500;
                const response = await randomNFT.changeCallbackGasLimit(ourUpdate);
                await response.wait(1);

                const changedGasLimit = await randomNFT.getCallbackGasLimit();

                assert.equal(ourUpdate.toString(), changedGasLimit.toString());
            })
        })
    });