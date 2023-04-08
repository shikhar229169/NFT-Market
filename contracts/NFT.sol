// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    uint256 private tokenCount;
    string public constant TOKEN_URI = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    
    constructor(string memory tokenName, string memory tokenSymbol) ERC721(tokenName, tokenSymbol) {
        tokenCount = 0;
    }

    function mintNFT() public returns(uint256) {
        _safeMint(msg.sender, tokenCount);
        tokenCount++;
        return tokenCount;
    }

    function tokenURI(uint256 /*tokenId*/) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCount() public view returns(uint256) {
        return tokenCount;
    }
}