// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/NostradaoMarket.sol";
import "../src/NostradaoOracle.sol";

contract NostradaoMarketTest is Test {
    NostradaoMarket public market;
    NostradaoOracle public oracle;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    
    function setUp() public {
        vm.startPrank(owner);
        oracle = new NostradaoOracle();
        market = new NostradaoMarket(address(oracle));
        oracle.setMarketContract(address(market));
        vm.stopPrank();
    }

    function testMarketCreation() public {
        vm.startPrank(user1);
        vm.deal(user1, 1 ether);
        
        uint256[] memory outcomes = new uint256[](2);
        outcomes[0] = 1;
        outcomes[1] = 2;
        
        market.createMarket{value: 0.1 ether}(
            "Will ETH reach $5000?",
            "Price prediction for ETH",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.CRYPTO
        );
        
        (
            string memory title,
            ,,,,,,,
            NostradaoMarket.MarketCategory category
        ) = market.getMarketInfo(0);
        
        assertEq(title, "Will ETH reach $5000?");
        assertEq(uint(category), uint(NostradaoMarket.MarketCategory.CRYPTO));
        vm.stopPrank();
    }

    function testPlaceBet() public {
        // Setup market
        testMarketCreation();
        
        vm.startPrank(user2);
        vm.deal(user2, 1 ether);
        
        market.placeBet{value: 0.5 ether}(0, 1);
        
        uint256 totalBets = market.getMarketBets(0, 1);
        assertEq(totalBets, 0.5 ether);
        vm.stopPrank();
    }

    function testMarketResolution() public {
        // Setup market and bets
        testPlaceBet();
        
        vm.warp(block.timestamp + 2 days);
        
        vm.startPrank(owner);
        oracle.resolveMarket(0, 1);
        
        (,,,,,bool resolved,,uint256 winningOutcome,) = market.getMarketInfo(0);
        assertTrue(resolved);
        assertEq(winningOutcome, 1);
        vm.stopPrank();
    }

    function testClaimWinnings() public {
        // Setup resolved market
        testMarketResolution();
        
        uint256 initialBalance = user2.balance;
        
        vm.startPrank(user2);
        market.claimWinnings(0);
        
        uint256 finalBalance = user2.balance;
        assertTrue(finalBalance > initialBalance);
        vm.stopPrank();
    }

    function testFailInvalidOutcome() public {
        testMarketCreation();
        
        vm.startPrank(user2);
        vm.deal(user2, 1 ether);
        
        market.placeBet{value: 0.5 ether}(0, 3); // Should fail - invalid outcome
        vm.stopPrank();
    }

    function testFailEarlyResolution() public {
        testPlaceBet();
        
        vm.startPrank(owner);
        oracle.resolveMarket(0, 1); // Should fail - too early
        vm.stopPrank();
    }
}
