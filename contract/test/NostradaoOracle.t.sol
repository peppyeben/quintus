// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/NostradaoOracle.sol";

contract NostradaoOracleTest is Test {
    NostradaoOracle public oracle;
    address public owner = address(1);
    address public marketMock = address(2);
    
    function setUp() public {
        vm.startPrank(owner);
        oracle = new NostradaoOracle();
        vm.stopPrank();
    }

    function testSetMarketContract() public {
        vm.startPrank(owner);
        oracle.setMarketContract(marketMock);
        assertEq(oracle.marketContract(), marketMock);
        vm.stopPrank();
    }

    function testFailNonOwnerSetMarket() public {
        vm.startPrank(address(3));
        oracle.setMarketContract(marketMock);
        vm.stopPrank();
    }
}
