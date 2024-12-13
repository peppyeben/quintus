// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/NostradaoMarket.sol";
import "../src/NostradaoOracle.sol";

contract DeployScript is Script {
    address public oracleAddress;
    address public marketAddress;

    function setUp() public {}

    function run() public {
        // Deploy the NostradaoOracle contract
        NostradaoOracle oracle = new NostradaoOracle();
        oracleAddress = address(oracle);
        console.log("Deployed NostradaoOracle at:", oracleAddress);

        // Deploy the NostradaoMarket contract, passing in the oracle address
        NostradaoMarket market = new NostradaoMarket(oracleAddress);
        marketAddress = address(market);
        console.log("Deployed NostradaoMarket at:", marketAddress);

        // Set the market contract address in the oracle
        oracle.setMarketContract(marketAddress);
    }
}
