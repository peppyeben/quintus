// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/QuintusOracles.sol";
import "../src/QuintusMarket.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Oracle first
        QuintusOracles oracle = new QuintusOracles();

        // Deploy Market with Oracle address
        QuintusMarket market = new QuintusMarket(address(oracle));

        // Set betting contract in Oracle
        oracle.setBettingContract(address(market));

        vm.stopBroadcast();
    }
}
