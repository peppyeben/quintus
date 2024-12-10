// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Nostradao.sol";

contract DeployNostradao is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Use BSC-specific addresses for oracle and fee collector
        address oracle = address(0x1); // Replace with BSC oracle address
        address feeCollector = address(0x2); // Replace with BSC fee collector address        
        vm.startBroadcast(deployerPrivateKey);

        Nostradao nostradao = new Nostradao(oracle, feeCollector);

         // Store deployed address
        address deployedAddress = address(new Nostradao(oracle, feeCollector));
        console.log("Nostradao deployed to:", deployedAddress);


        vm.stopBroadcast();
    }
}
