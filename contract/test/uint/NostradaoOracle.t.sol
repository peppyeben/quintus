// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/NostradaoMarket.sol";
import "../../src/NostradaoBettingOracles.sol";

contract NostradaoBettingOracleTest is Test {
    NostradaoBettingOracle public oracle;
    NostradaoMarket public market;
    address public owner = address(1);
    address public marketMock = address(2);
    
    function setUp() public {
        vm.startPrank(owner);
        oracle = new NostradaoBettingOracle();
        market = new NostradaoMarket(address(oracle));
        vm.stopPrank();
    }

    function testGetWinningOutcome() public {
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        assertEq(oracle.getWinningOutcome(0), "Team A");
    }

    function testFailGetUnresolvedOutcome() public {
        oracle.getWinningOutcome(999);
    }

    function testFailResolveWithoutBettingContract() public {
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
    }

    function testSetBettingContract() public {
        vm.startPrank(owner);
        oracle.setBettingContract(marketMock);
        assertEq(oracle.bettingContract(), marketMock);
        vm.stopPrank();
    }

    function testFailNonOwnerSetMarket() public {
        vm.startPrank(address(3));
        oracle.setBettingContract(marketMock);
        vm.stopPrank();
    }
}
