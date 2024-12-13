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
    address public user3;
    
    uint256 public constant MARKET_CREATION_FEE = 0.01 ether;
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        oracle = new NostradaoBettingOracle();
        market = new NostradaoMarket(address(oracle));
        
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
    }

    receive() external payable {}

    function testCreateMarket() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 betDeadline = block.timestamp + 1 days;
        uint256 resolutionDeadline = block.timestamp + 2 days;
        
        vm.startPrank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        vm.stopPrank();
        
        assertEq(market.marketCount(), 1);
    }

    function testPlaceBet() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 betDeadline = block.timestamp + 1 days;
        uint256 resolutionDeadline = block.timestamp + 2 days;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team A");
        
        assertEq(market.getMarketBets(0, "Team A"), 1 ether);
    }
    function testResolveMarket() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 betDeadline = 86401;
        uint256 resolutionDeadline = 172801;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team A");
        
        vm.warp(86402); // Warp past bet deadline
        
        // Set oracle permissions first
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.warp(172801); // Warp to resolution deadline
        
        // Resolve as owner through oracle
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        (,,,,, bool resolved,,string memory winningOutcome,) = market.getMarketInfo(0);
        assertTrue(resolved);
        assertEq(keccak256(abi.encodePacked(winningOutcome)), keccak256(abi.encodePacked("Team A")));
    }
    function testClaimWinnings() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 betDeadline = 86401;
        uint256 resolutionDeadline = 172801;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team A");
        
        vm.warp(86402); // Warp past bet deadline
        
        // Set oracle permissions first
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.warp(172801); // Warp to resolution deadline
        
        // Resolve as owner
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        uint256 balanceBefore = user2.balance;
        vm.prank(user2);
        market.claimWinnings(0);
        uint256 balanceAfter = user2.balance;
        
        assertTrue(balanceAfter > balanceBefore);
    }


    function testFailInvalidBetDeadline() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 betDeadline = block.timestamp - 1;
        uint256 resolutionDeadline = block.timestamp + 2 days;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
    }
    function testFailInsufficientMarketCreationFee() public {
    string[] memory outcomes = new string[](2);
    outcomes[0] = "Team A";
    outcomes[1] = "Team B";
    
    vm.prank(user1);
    market.createMarket{value: 0.009 ether}( // Less than required fee
        "World Cup Final",
        "Who will win?",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        NostradaoMarket.MarketCategory.SPORTS
    );
    }

    function testFailInsufficientOutcomes() public {
        string[] memory outcomes = new string[](1); // Only one outcome
        outcomes[0] = "Team A";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
    }

    function testExactWinningAmounts() public {
    string[] memory outcomes = new string[](2);
    outcomes[0] = "Team A";
    outcomes[1] = "Team B";
    
    vm.prank(user1);
    market.createMarket{value: MARKET_CREATION_FEE}(
        "World Cup Final",
        "Who will win?",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        NostradaoMarket.MarketCategory.SPORTS
    );
    
    // User2 bets 10 ETH on Team A
    uint256 betAmount = 10 ether;
    vm.prank(user2);
    market.placeBet{value: betAmount}(0, "Team A");
    
    vm.warp(block.timestamp + 2 days + 1);
    
    vm.prank(owner);
    oracle.setBettingContract(address(market));
    
    vm.prank(owner);
    oracle.resolveBet(0, "Team A");
    
    // Calculate exact expected amounts
    uint256 expectedPlatformFee = (betAmount * 25) / 1000; // 2.5%
    uint256 expectedCreatorFee = (betAmount * 10) / 1000;  // 1%
    uint256 expectedWinnings = betAmount - expectedPlatformFee - expectedCreatorFee;
    
    uint256 ownerBalanceBefore = owner.balance;
    uint256 creatorBalanceBefore = user1.balance;
    uint256 winnerBalanceBefore = user2.balance;
    
    vm.prank(user2);
    market.claimWinnings(0);
    
    // Verify exact amounts with no tolerance
    assertEq(owner.balance - ownerBalanceBefore, expectedPlatformFee);
    assertEq(user1.balance - creatorBalanceBefore, expectedCreatorFee);
    assertEq(user2.balance - winnerBalanceBefore, expectedWinnings);
    }

    function testGetMarketInfoAndBets() public {
    string[] memory outcomes = new string[](3);
    outcomes[0] = "Team A";
    outcomes[1] = "Team B";
    outcomes[2] = "Draw";
    
    uint256 betDeadline = block.timestamp + 1 days;
    uint256 resolutionDeadline = block.timestamp + 2 days;
    
    vm.prank(user1);
    market.createMarket{value: MARKET_CREATION_FEE}(
        "Premier League Final",
        "Who will win the match?",
        betDeadline,
        resolutionDeadline,
        outcomes,
        NostradaoMarket.MarketCategory.SPORTS
    );
    
    // Place different bets
    vm.prank(user1);
    market.placeBet{value: 2 ether}(0, "Team A");
    
    vm.prank(user2);
    market.placeBet{value: 3 ether}(0, "Team B");
    
    vm.prank(user2);
    market.placeBet{value: 1.5 ether}(0, "Draw");
    
    // Verify market info
    (
        string memory title,
        string memory description,
        uint256 retrievedBetDeadline,
        uint256 retrievedResolutionDeadline,
        address creator,
        bool resolved,
        string[] memory retrievedOutcomes,
        string memory winningOutcome,
        NostradaoMarket.MarketCategory category
    ) = market.getMarketInfo(0);
    
    // Assert market info
    assertEq(title, "Premier League Final");
    assertEq(description, "Who will win the match?");
    assertEq(retrievedBetDeadline, betDeadline);
    assertEq(retrievedResolutionDeadline, resolutionDeadline);
    assertEq(creator, user1);
    assertFalse(resolved);
    assertEq(retrievedOutcomes.length, 3);
    assertEq(winningOutcome, "");
    assertEq(uint(category), uint(NostradaoMarket.MarketCategory.SPORTS));
    
    // Verify bet amounts for each outcome
    assertEq(market.getMarketBets(0, "Team A"), 2 ether);
    assertEq(market.getMarketBets(0, "Team B"), 3 ether);
    assertEq(market.getMarketBets(0, "Draw"), 1.5 ether);
    }



    function testFailBetAfterDeadline() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.warp(block.timestamp + 1 days + 1); // Past betting deadline
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team A");
    }

    function testFailBetOnInvalidOutcome() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team C"); // Invalid outcome
    }

    function testFailClaimBeforeResolution() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team A");
        
        vm.prank(user2);
        market.claimWinnings(0); // Should fail as market isn't resolved
    }

    function testFailResolutionBeforeDeadline() public {
    string[] memory outcomes = new string[](2);
    outcomes[0] = "Team A";
    outcomes[1] = "Team B";
    
    vm.prank(user1);
    market.createMarket{value: MARKET_CREATION_FEE}(
        "World Cup Final",
        "Who will win?",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        NostradaoMarket.MarketCategory.SPORTS
    );
    
    vm.prank(owner);
    oracle.setBettingContract(address(market));
    
    // Try to resolve market before resolution deadline
    market.resolveMarket(0);
    }


    function testFailDoubleResolution() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.warp(block.timestamp + 2 days + 1);
        
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        // Try to resolve again
        vm.prank(owner);
        oracle.resolveBet(0, "Team B");
    }

    function testTransferWinningsExactAmounts() public {
    string[] memory outcomes = new string[](2);
    outcomes[0] = "Team A";
    outcomes[1] = "Team B";

    vm.prank(owner);
    oracle.setBettingContract(address(market));
    
    vm.prank(user1);
    market.createMarket{value: MARKET_CREATION_FEE}(
        "World Cup Final",
        "Who will win?",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        NostradaoMarket.MarketCategory.SPORTS
    );
    
    // Place multiple bets on Team A
    vm.prank(user2);
    market.placeBet{value: 5 ether}(0, "Team A");
    
    vm.prank(user3);
    market.placeBet{value: 3 ether}(0, "Team A");
    
    // Place bet on Team B
    vm.prank(user1);
    market.placeBet{value: 2 ether}(0, "Team B");
    
    uint256 totalPool = 10 ether; // 5 + 3 + 2 ether
    uint256 winningPool = 8 ether; // 5 + 3 ether (Team A bets)
    
    // Record initial balances
    uint256 ownerInitialBalance = owner.balance;
    uint256 creatorInitialBalance = user1.balance;
    uint256 winner1InitialBalance = user2.balance;
    uint256 winner2InitialBalance = user3.balance;
    
    // Resolve market
    vm.warp(block.timestamp + 2 days + 1);
    vm.prank(owner);
    oracle.resolveBet(0, "Team A");
    
    // Winners claim their winnings
    vm.prank(user2);
    market.claimWinnings(0);
    vm.prank(user3);
    market.claimWinnings(0);
    
    // Calculate expected amounts
    uint256 platformFee = (totalPool * 25) / 1000; // 2.5%
    uint256 creatorFee = (totalPool * 10) / 1000;  // 1%
    
    uint256 winner1Share = (5 ether * totalPool) / winningPool;
    uint256 winner2Share = (3 ether * totalPool) / winningPool;
    
    uint256 winner1ExpectedWinnings = winner1Share - (winner1Share * 35) / 1000; // Minus fees
    uint256 winner2ExpectedWinnings = winner2Share - (winner2Share * 35) / 1000; // Minus fees
    
    // Verify exact amounts received
    assertEq(owner.balance - ownerInitialBalance, platformFee);
    assertEq(user1.balance - creatorInitialBalance, creatorFee);
    assertEq(user2.balance - winner1InitialBalance, winner1ExpectedWinnings);
    assertEq(user3.balance - winner2InitialBalance, winner2ExpectedWinnings);
    }



    function testFailClaimWithoutBetting() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.warp(block.timestamp + 2 days + 1);
        
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        // Try to claim without placing any bets
        vm.prank(user2);
        market.claimWinnings(0);
    }

    function testCorrectFeeDistribution() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user2);
        market.placeBet{value: 10 ether}(0, "Team A");
        
        vm.warp(block.timestamp + 2 days + 1);
        
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        uint256 ownerBalanceBefore = owner.balance;
        uint256 creatorBalanceBefore = user1.balance;
        
        vm.prank(user2);
        market.claimWinnings(0);
        
        uint256 platformFee = (10 ether * 25) / 1000; // 2.5%
        uint256 creatorFee = (10 ether * 10) / 1000;  // 1%
        
        assertEq(owner.balance - ownerBalanceBefore, platformFee);
        assertEq(user1.balance - creatorBalanceBefore, creatorFee);
    }

    function testMultipleOutcomesBetting() public {
        string[] memory outcomes = new string[](3);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        outcomes[2] = "Draw";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user1);
        market.placeBet{value: 1 ether}(0, "Team A");
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team B");
        
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Draw");
        
        assertEq(market.getMarketBets(0, "Team A"), 1 ether);
        assertEq(market.getMarketBets(0, "Team B"), 1 ether);
        assertEq(market.getMarketBets(0, "Draw"), 1 ether);
    }


    function testMultipleBetsAndClaims() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        // Multiple bets from different users
        vm.prank(user1);
        market.placeBet{value: 1 ether}(0, "Team A");
        
        vm.prank(user2);
        market.placeBet{value: 2 ether}(0, "Team A");
        
        vm.warp(block.timestamp + 1 days + 1);
        
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.warp(block.timestamp + 1 days);
        
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        uint256 user1BalanceBefore = user1.balance;
        uint256 user2BalanceBefore = user2.balance;
        
        vm.prank(user1);
        market.claimWinnings(0);
        
        vm.prank(user2);
        market.claimWinnings(0);
        
        assertTrue(user1.balance > user1BalanceBefore);
        assertTrue(user2.balance > user2BalanceBefore);
    }

        function testMarketInfoAccuracy() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 betDeadline = block.timestamp + 1 days;
        uint256 resolutionDeadline = block.timestamp + 2 days;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        (
            string memory title,
            string memory description,
            uint256 retrievedBetDeadline,
            uint256 retrievedResolutionDeadline,
            address creator,
            bool resolved,
            string[] memory retrievedOutcomes,
            string memory winningOutcome,
            NostradaoMarket.MarketCategory category
        ) = market.getMarketInfo(0);
        
        assertEq(title, "World Cup Final");
        assertEq(description, "Who will win?");
        assertEq(retrievedBetDeadline, betDeadline);
        assertEq(retrievedResolutionDeadline, resolutionDeadline);
        assertEq(creator, user1);
        assertFalse(resolved);
        assertEq(retrievedOutcomes.length, 2);
        assertEq(retrievedOutcomes[0], "Team A");
        assertEq(retrievedOutcomes[1], "Team B");
        assertEq(winningOutcome, "");
        assertEq(uint(category), uint(NostradaoMarket.MarketCategory.SPORTS));
    }

    function testTotalPoolAccumulation() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        vm.prank(user1);
        market.placeBet{value: 1 ether}(0, "Team A");
        assertEq(market.getMarketBets(0, "Team A"), 1 ether);
        
        vm.prank(user2);
        market.placeBet{value: 2 ether}(0, "Team A");
        assertEq(market.getMarketBets(0, "Team A"), 3 ether);
        
        vm.prank(user2);
        market.placeBet{value: 1.5 ether}(0, "Team B");
        assertEq(market.getMarketBets(0, "Team B"), 1.5 ether);
    }

    function testExactFeeCalculations() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "World Cup Final",
            "Who will win?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        uint256 betAmount = 10 ether;
        vm.prank(user2);
        market.placeBet{value: betAmount}(0, "Team A");
        
        vm.warp(block.timestamp + 2 days + 1);
        
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");
        
        uint256 expectedPlatformFee = (betAmount * 25) / 1000; // 2.5%
        uint256 expectedCreatorFee = (betAmount * 10) / 1000;  // 1%
        uint256 expectedWinnings = betAmount - expectedPlatformFee - expectedCreatorFee;
        
        uint256 ownerBalanceBefore = owner.balance;
        uint256 creatorBalanceBefore = user1.balance;
        uint256 winnerBalanceBefore = user2.balance;
        
        vm.prank(user2);
        market.claimWinnings(0);
        
        assertEq(owner.balance - ownerBalanceBefore, expectedPlatformFee);
        assertEq(user1.balance - creatorBalanceBefore, expectedCreatorFee);
        assertEq(user2.balance - winnerBalanceBefore, expectedWinnings);
    }

    



    function testMarketEdgeCases() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        // Test exact deadline
        uint256 betDeadline = block.timestamp;
        uint256 resolutionDeadline = block.timestamp + 1;
        
        vm.expectRevert();
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Description",
            betDeadline,
            resolutionDeadline,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
    }

    function testExactFeeTransfers() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 initialBalance = address(this).balance;
        
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Description",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
        
        assertEq(address(this).balance, initialBalance - MARKET_CREATION_FEE);
    }



}
