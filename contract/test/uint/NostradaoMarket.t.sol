// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/NostradaoMarket.sol";
import "../../src/NostradaoBettingOracles.sol";

contract NostradaoMarketTest is Test {
    NostradaoMarket public market;
    NostradaoBettingOracle public oracle;
    address public owner;
    address public user1;
    address public user2;
    uint256 public constant MARKET_CREATION_FEE = 0.01 ether;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        oracle = new NostradaoBettingOracle();
        market = new NostradaoMarket(address(oracle));
    }

    receive() external payable {}

    function testCompleteMarketLifecycle() public {
        // Market Creation
        string[] memory outcomes = new string[](3);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        outcomes[2] = "Draw";

        uint256 betDeadline = block.timestamp + 1 days;
        uint256 resolutionDeadline = block.timestamp + 2 days;

        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Premier League Final",
            "Who will win?",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );

        // Verify market creation
        assertEq(market.marketCount(), 1);
        
        // Multiple bets from different users
        vm.prank(user1);
        market.placeBet{value: 2 ether}(0, "Team A");
        
        vm.prank(user2);
        market.placeBet{value: 3 ether}(0, "Team B");
        
        // Verify bet amounts
        assertEq(market.getMarketBets(0, "Team A"), 2 ether);
        assertEq(market.getMarketBets(0, "Team B"), 3 ether);

        // Market Resolution
        vm.warp(betDeadline + 1);
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.warp(resolutionDeadline);
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");

        // Verify resolution
        (,,,,, bool resolved,, string memory winningOutcome,) = market.getMarketInfo(0);
        assertTrue(resolved);
        assertEq(winningOutcome, "Team A");

        // Claim and verify winnings
        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claimWinnings(0);
        assertTrue(user1.balance > user1BalanceBefore);
    }

    function testComprehensiveFailureCases() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";

        // Test invalid deadlines
        vm.expectRevert();
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Description",
            block.timestamp - 1,
            block.timestamp + 1,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );

        // Create valid market for subsequent tests
        uint256 betDeadline = block.timestamp + 1 days;
        uint256 resolutionDeadline = block.timestamp + 2 days;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Valid Market",
            "Description",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );

        // Test invalid bet scenarios
        vm.expectRevert();
        vm.prank(user2);
        market.placeBet{value: 0}(0, "Team A"); // Zero value bet

        vm.warp(betDeadline + 1);
        vm.expectRevert();
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team A"); // Bet after deadline

        vm.expectRevert();
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Invalid Team"); // Invalid outcome
    }

    function testExactFeeCalculations() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";

        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Fee Test Market",
            "Description",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );

        uint256 betAmount = 10 ether;
        vm.prank(user2);
        market.placeBet{value: betAmount}(0, "Team A");

        // Calculate expected fees
        uint256 expectedPlatformFee = (betAmount * 25) / 1000; // 2.5%
        uint256 expectedCreatorFee = (betAmount * 10) / 1000; // 1%
        uint256 expectedWinnings = betAmount - expectedPlatformFee - expectedCreatorFee;

        // Record initial balances
        uint256 ownerBalanceBefore = owner.balance;
        uint256 creatorBalanceBefore = user1.balance;
        uint256 betterBalanceBefore = user2.balance;

        // Resolve and claim
        vm.warp(block.timestamp + 2 days + 1);
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");

        vm.prank(user2);
        market.claimWinnings(0);

        // Verify exact fee distributions
        assertEq(owner.balance - ownerBalanceBefore, expectedPlatformFee);
        assertEq(user1.balance - creatorBalanceBefore, expectedCreatorFee);
        assertEq(user2.balance - betterBalanceBefore, expectedWinnings);
    }

    function testInvalidBetHandling() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Description",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );

        // Test invalid outcome
        vm.expectRevert();
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team C");

        // Test zero value bet
        vm.expectRevert();
        vm.prank(user2);
        market.placeBet{value: 0}(0, "Team A");

        // Test non-existent market
        vm.expectRevert();
        vm.prank(user2);
        market.placeBet{value: 1 ether}(99, "Team A");
    }

    function testComplexFeeDistribution() public {
        string[] memory outcomes = new string[](3);
        outcomes[0] = "A";
        outcomes[1] = "B";
        outcomes[2] = "C";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Description",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );

        uint256 betAmount = 10 ether;
        vm.prank(user2);
        market.placeBet{value: betAmount}(0, "A");

        vm.warp(block.timestamp + 2 days + 1);
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        vm.prank(owner);
        oracle.resolveBet(0, "A");

        uint256 platformFee = (betAmount * 25) / 1000;
        uint256 creatorFee = (betAmount * 10) / 1000;

        uint256 ownerBalanceBefore = owner.balance;
        uint256 creatorBalanceBefore = user1.balance;

        vm.prank(user2);
        market.claimWinnings(0);

        assertEq(owner.balance - ownerBalanceBefore, platformFee);
        assertEq(user1.balance - creatorBalanceBefore, creatorFee);
    }

}
