// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./functionSelector_Signature.sol";

contract CallAnything {
    functionCallDirectly private immutable meowContract;
    constructor(address _meowContract) {
        // as the contract "functionCallDirectly" has a receive function thus we need to first
        // typecast address to payable
        meowContract = functionCallDirectly(payable(_meowContract));
    }

    function idharSeBhiKarleteHe(address meow, uint256 meowCt) public payable returns (bool) {
        bytes4 selector = bytes4(keccak256(bytes("billiBoleMeow(address,uint256)")));

        (bool success, ) = address(meowContract).call{value: 1 ether}(
            abi.encodeWithSelector(selector, meow, meowCt)
        );
        return success;
    }

    function ekAurTarika(address meow, uint256 meowCt) public returns (bool) {
        (bool success ,) = address(meowContract).call(
            abi.encodeWithSignature("billiBoleMeow(address,uint256)", meow, meowCt)
        );
        return success;
    }
}