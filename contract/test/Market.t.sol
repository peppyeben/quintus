// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Market.sol";

contract MarketTest is Test {
    Market market;
    address creator = address(0xABCD);
    address oracle = address(0x1234);
    address feeCollector = address(0x5678);

    string description = "Will it rain tomorrow?";
    string[] outcomes = ["Yes", "No"];
    uint256 bettingDeadline = block.timestamp + 1 days;
    uint256 resolutionDeadline = block.timestamp + 2 days;

    function setUp() public {
        Market.MarketParameters memory params = Market.MarketParameters({
            creator: creator,
            description: description,
            outcomes: outcomes,
            bettingDeadline: bettingDeadline,
            resolutionDeadline: resolutionDeadline,
            oracle: oracle,
            feeCollector: feeCollector
        });
        market = new Market(params);
    }

    function testConstructor() public view{
        assertEq(market.creator(), creator);
        assertEq(market.description(), description);
        assertEq(market.outcomes(0), outcomes[0]);
        assertEq(market.outcomes(1), outcomes[1]);
        assertEq(market.bettingDeadline(), bettingDeadline);
        assertEq(market.resolutionDeadline(), resolutionDeadline);
        assertEq(market.oracle(), oracle);
        assertEq(market.feeCollector(), feeCollector);
    }

    function testPlaceBet() public {
        vm.startPrank(address(0x1));
        vm.deal(address(0x1), 1 ether);

        uint256 initialFeeCollectorBalance = feeCollector.balance;
        uint256 betAmount = 1 ether;

        market.placeBet{value: betAmount}(0); // Bet on outcome "Yes"

        assertEq(market.totalBets(), (betAmount * 99) / 100); // Check total bets after fee deduction
        assertEq(market.outcomePoolSizes(0), (betAmount * 99) / 100);
        assertEq(feeCollector.balance - initialFeeCollectorBalance, (betAmount * 1) / 100); // 1% fee
    }

    function testResolveMarket() public {
        vm.warp(resolutionDeadline + 1); // Fast forward time to after the resolution deadline
        vm.prank(oracle); // Simulate oracle calling the function
        market.resolveMarket(1); // Outcome "No"

        assertEq(market.resolved(), true);
        assertEq(market.winningOutcome(), 1); // Outcome "No" is winning
    }

    function testClaimWinnings() public {
        // Place bet
        vm.startPrank(address(0x1));
        vm.deal(address(0x1), 1 ether);
        market.placeBet{value: 1 ether}(0); // Bet on outcome "Yes"

        // Resolve market
        vm.stopPrank();
        vm.warp(resolutionDeadline + 1);
        vm.prank(oracle);
        market.resolveMarket(0); // Outcome "Yes"

        // Claim winnings
        uint256 initialBalance = address(0x1).balance;
        vm.prank(address(0x1));
        market.claimWinnings();

        uint256 expectedPayout = (1 ether * 1e18) / 1 ether; // 1:1 odds
        assertEq(address(0x1).balance - initialBalance, expectedPayout);
    }
}
