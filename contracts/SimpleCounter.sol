// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleCounter {
    uint256 public counter;

    event IncrementCounter(uint256 newCounterValue, address msgSender);

    function increment() external {
        counter++;
        emit IncrementCounter(counter, msg.sender);
    }
}
