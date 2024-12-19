// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/NostradaoMarket.sol";
import "../src/NostradaoBettingOracles.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Oracle first
        NostradaoBettingOracle oracle = new NostradaoBettingOracle();

        // Deploy Market with Oracle address
        NostradaoMarket market = new NostradaoMarket(address(oracle));

        // Set betting contract in Oracle
        oracle.setBettingContract(address(market));

        vm.stopBroadcast();
    }
}
