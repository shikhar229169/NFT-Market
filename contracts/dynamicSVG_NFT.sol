// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

// mint, storing svg img, showing images dynamically

// user can create their own highValue and can change it whenever they want or we can have a certain cooldown
// here highValue represents for >= which the NFT will be a happy Cat

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error dynamicNFT__tokenNotFound();
error dynamicNFT__notOwner();

contract dynamicNFT is ERC721 {
    uint256 private tokenCounter;
    string private i_sadURI;
    string private i_happyURI;
    AggregatorV3Interface private immutable aggregatorV3Interface;
    mapping(uint256 => int256) private tokenIdToHighPrice;

    event NFTMinted(uint256 indexed tokenCounter, int256 indexed highValue);
    event highPriceChanged(uint256 indexed tokenId, int256 indexed oldHighPrice, int256 indexed newHighPrice);

    constructor(address aggregatorV3InterfaceAddress, string memory sadSVG, string memory happySVG) ERC721("Dynamic SVG NFT", "DSN") {
        tokenCounter = 0;
        i_sadURI = svgToImgURI(sadSVG);
        i_happyURI = svgToImgURI(happySVG);
        aggregatorV3Interface = AggregatorV3Interface(aggregatorV3InterfaceAddress);
    }

    // highvalue should be in terms of wei (10^18)
    function mintNFT(int256 highValue) public {
        _safeMint(msg.sender, tokenCounter);
        // owner can change highValue whenever they want or their can be a cooldown feature
        tokenIdToHighPrice[tokenCounter] = highValue;
        tokenCounter++;
        emit NFTMinted(tokenCounter, highValue);
    }

    function changeHighPrice(uint256 tokenId, int256 newHighPrice) public {
        if (!_exists(tokenId)) {
            revert dynamicNFT__tokenNotFound();
        }

        if (msg.sender != _ownerOf(tokenId)) {
            revert dynamicNFT__notOwner();
        }

        int256 oldHighPrice = tokenIdToHighPrice[tokenId];

        tokenIdToHighPrice[tokenId] = newHighPrice;

        emit highPriceChanged(tokenId, oldHighPrice, newHighPrice);
    }

    function svgToImgURI(string memory svgImage) public pure returns (string memory) {
        // reads the svgImage and gets the base64 hash of that
        string memory URI = Base64.encode(bytes(svgImage));
        return string.concat("data:image/svg+xml;base64,", URI);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert dynamicNFT__tokenNotFound();
        }

        (, int256 price, , , ) = aggregatorV3Interface.latestRoundData();

        string memory imageURI = i_sadURI;
        string memory nameOfNFT = "Sed Life";
        if (price >= tokenIdToHighPrice[tokenId]) {
            imageURI = i_happyURI;
            nameOfNFT = "Happy happy happy";
        }


        // instead of abi.encodePacked we can use string.concat as it also supports multiple inputs, then we can convert our concatenated stringt to bytes

        // here the result produced by bytes on abi.encodePacked will remain the same as it is after applying abi.encodePacked
        string memory jsonURI = string.concat(_baseURI(), Base64.encode(bytes(
            abi.encodePacked('{"name":"', nameOfNFT, '","description":"A dynamic SVG NFT, changes with the change in price feeds",', '"image":"', imageURI, '"}')
        )));

        return jsonURI;
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }

    function getSadURI() public view returns (string memory) {
        return i_sadURI;
    }

    function getHappyURI() public view returns (string memory) {
        return i_happyURI;
    }

    function getPriceFeedsAddress() public view returns (address) {
        return address(aggregatorV3Interface);
    } 

    function highPriceOf(uint256 tokenId) public view returns (int256) {
        return tokenIdToHighPrice[tokenId];
    }
}