// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/NostradaoMarket.sol";
import "../src/NostradaoBettingOracles.sol";

contract DeployScript is Script {
    address public bettingOracleAddress;
    address public marketAddress;

    function setUp() public {}

    function run() public {
        // Deploy the NostradaoBettingOracle contract
        NostradaoBettingOracle bettingOracle = new NostradaoBettingOracle();
        bettingOracleAddress = address(bettingOracle);
        console.log("Deployed NostradaoBettingOracle at:", bettingOracleAddress);

        // Deploy the NostradaoMarket contract, passing in the betting oracle address
        NostradaoMarket market = new NostradaoMarket(bettingOracleAddress);
        marketAddress = address(market);
        console.log("Deployed NostradaoMarket at:", marketAddress);

        // Set the betting contract address in the oracle
        bettingOracle.setBettingContract(marketAddress);
    }
}
