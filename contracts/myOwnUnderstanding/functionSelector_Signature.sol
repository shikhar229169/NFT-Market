// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract functionCallDirectly {
    address public meow;
    uint256 public meowMeowCount;

    function billiBoleMeow(address _meow, uint256 _meowMeowCount) public payable {
        meow = _meow;
        meowMeowCount = _meowMeowCount;
    }

    function getFunctionSelector() public pure returns (bytes4) {
        return bytes4(keccak256(bytes("billiBoleMeow(address,uint256)")));
    }

    function getFunctionDirectCallData(address _meow, uint256 _meowMeowCount) public pure returns(bytes memory) {
        return abi.encodeWithSelector(getFunctionSelector(), _meow, _meowMeowCount);
    }

    function callItWithoutActuallyCallingIt(address _meow, uint256 _meowMeowCount) public returns(bool, bytes memory) {
        (bool success, bytes memory data) = address(this).call(
            abi.encodeWithSelector(getFunctionSelector(), _meow, _meowMeowCount)
        );
        return (success, data);
    }

    receive() external payable {

    }
}