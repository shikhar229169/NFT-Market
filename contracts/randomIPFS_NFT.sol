// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error randomNFT__breedNotFound();
error randomNFT__lessMintFees();
error randomNFT__notOwner();
error randomNFT__zeroBalance();
error randomNFT__ethTransferFailed();

contract randomNFT is VRFConsumerBaseV2, ERC721URIStorage {
    enum dogBreed {
        pug, 
        shiba, 
        bernard
    }

    address private immutable i_owner; 

    // 3 tokens (dogs- pug, shiba inu and st. bernard)
    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    uint256 private immutable mintFees;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint256 private constant MAX_CHANCE_LIMIT = 100;
    uint256[3] private chances = [10, 50, MAX_CHANCE_LIMIT];
    string[3] internal dogieURI;

    mapping (uint256 => address) private reqIdToSender;
    uint256 private tokenCounter;


    event NFTRequested(uint256 indexed reqId, address indexed buyer);
    event NFTMinted(dogBreed indexed breed, address indexed owner, uint256 indexed tokenId);

    constructor(address _vrfCoordinator, uint256 _mintFees, bytes32 _keyHash, uint64 _subId, uint32 _callbackGasLimit, string[3] memory _dogieURI) VRFConsumerBaseV2(_vrfCoordinator) ERC721("Doggiee", "PILLA") {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_keyHash = _keyHash;
        i_subId = _subId;
        callbackGasLimit = _callbackGasLimit;
        tokenCounter = 0;
        dogieURI = _dogieURI;
        mintFees = _mintFees;
        i_owner = msg.sender;
    }

    function requestDoggieToken() public payable {
        if (msg.value < mintFees) {
            revert randomNFT__lessMintFees();
        }

        uint256 reqId = vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            REQUEST_CONFIRMATIONS,
            callbackGasLimit,
            NUM_WORDS
        );

        reqIdToSender[reqId] = msg.sender;

        emit NFTRequested(reqId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 tokenId = tokenCounter;
        tokenCounter++;
        uint256 myNumber = randomWords[0] % MAX_CHANCE_LIMIT;
        address dogOwner = reqIdToSender[requestId];
        dogBreed breed = getBreed(myNumber);
        _safeMint(dogOwner, tokenId);
        _setTokenURI(tokenId, dogieURI[uint256(breed)]);
        emit NFTMinted(breed, dogOwner, tokenId);
    }

    function getChancesArray() public view returns(uint256[3] memory) {
        return chances;
    }

    function getBreed(uint256 randomNumber) public view returns(dogBreed) {
        // 0 to 9 - pug (10% chances)
        // 10 to 49 - shiba (40% chances)
        // 50 to 99- bernard (50% chances)
        uint256 prev = 0;

        for (uint256 i=0; i<chances.length; i++) {
            if (randomNumber>=prev && randomNumber<chances[i]) {
                return dogBreed(i);
            }
            prev = chances[i];
        }

        revert randomNFT__breedNotFound();
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert randomNFT__notOwner();
        }
        _;
    }

    function withdraw() public onlyOwner {
        if (address(this).balance == 0) {
            revert randomNFT__zeroBalance();
        }

        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        if (!success) {
            revert randomNFT__ethTransferFailed();
        }
    }

    function changeCallbackGasLimit(uint32 newLimit) public onlyOwner {
        callbackGasLimit = newLimit;
    }

    function getSender(uint256 requestId) public view returns(address) {
        return reqIdToSender[requestId];
    }

    function getTokenCounter() public view returns(uint256) {
        return tokenCounter;
    }

    function getMintFees() public view returns (uint256) {
        return mintFees;
    }

    function getDogieURI(uint256 idx) public view returns (string memory) {
        return dogieURI[idx];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getVrfCoordinatorAddress() public view returns (address) {
        return address(vrfCoordinator);
    }

    function getKeyHash() public view returns (bytes32) {
        return i_keyHash;
    }

    function getSubId() public view returns (uint64) {
        return i_subId;
    }

    function getCallbackGasLimit() public view returns (uint32) {
        return callbackGasLimit;
    }

    function getNumWords() public pure returns (uint32) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint16) {
        return REQUEST_CONFIRMATIONS;
    }
}