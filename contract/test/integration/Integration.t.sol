// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import "../../src/NostradaoMarket.sol";
import "../../src/NostradaoOracle.sol";

contract IntegrationTest is Test {
    NostradaoMarket public market;
    NostradaoOracle public oracle;
    address owner;

    receive() external payable {}

    function setUp() public {
        owner = makeAddr("owner");
        vm.startPrank(owner);
        oracle = new NostradaoOracle();
        market = new NostradaoMarket(address(oracle));
        oracle.setMarketContract(address(market));
        vm.stopPrank();
    }

    function testFullCycle() public {
        // Create market
        string memory question = "Will ETH reach $3000 by end of 2024?";
        string memory description = "Market for ETH price prediction";
        uint256 deadline = block.timestamp + 1 days;
        uint256 resolutionTime = deadline + 1 days;
        uint256[] memory validOutcomes = new uint256[](2);
        validOutcomes[0] = 1; // Yes
        validOutcomes[1] = 2; // No
        
        // Fund the creator
        vm.deal(address(this), 1 ether);
        
        // Create market with sufficient creation fee
        market.createMarket{value: 0.01 ether}(
            question,
            description,
            deadline,
            resolutionTime,
            validOutcomes,
            NostradaoMarket.MarketCategory.CRYPTO
        );

        // Setup users with sufficient funds
        address user1 = makeAddr("user1");
        address user2 = makeAddr("user2");
        
        vm.deal(user1, 2 ether);
        vm.deal(user2, 2 ether);

        // Place bets with proper values
        vm.prank(user1);
        market.placeBet{value: 0.5 ether}(0, 1);

        vm.prank(user2);
        market.placeBet{value: 0.5 ether}(0, 2);

        // Move to resolution time
        vm.warp(resolutionTime);
        
        // Resolve market with owner
        vm.prank(owner);
        oracle.resolveMarket(0, 1);

        // Claim winnings
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        market.claimWinnings(0);
        
        // Verify winning claim
        assertTrue(user1.balance > balanceBefore);
    }
}