// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/QuintusMarket.sol";
import "../../src/QuintusOracles.sol";

contract QuintusMarketTest is Test {
    QuintusMarket public market;
    QuintusOracles public oracle;
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    uint256 public constant MARKET_CREATION_FEE = 0.01 ether;
    event MarketReadyForResolution(
        uint256 indexed marketId,
        string betTitle,
        string[] outcomes,
        uint256 totalPool,
        address creator,
        QuintusMarket.MarketCategory category
    );
    error AlreadyPaid();
    error NoWinningsToClaim();
    error MarketNotResolved();
    error BettingDeadlinePassed();
    error TooEarlyToResolve();
    error BettingAmountCannotBeZero();




    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
        oracle = new QuintusOracles();
        market = new QuintusMarket(address(oracle));
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
            QuintusMarket.MarketCategory.SPORTS
        );

        // Verify market creation
        assertEq(market.marketCount(), 1);
        
        // Multiple bets from different users
        vm.prank(user1);
        market.placeBet{value: 2 ether}(0, "Team A");
        
        vm.prank(user2);
        market.placeBet{value: 3 ether}(0, "Team B");
        
       // Verify bet amounts
    (uint256 totalBetsA, ) = market.getMarketBets(0, "Team A");
    assertEq(totalBetsA, 2 ether);

    (uint256 totalBetsB, ) = market.getMarketBets(0, "Team B"); 
    assertEq(totalBetsB, 3 ether);


        // Market Resolution
        vm.warp(betDeadline + 1);
        vm.prank(owner);
        oracle.setBettingContract(address(market));
        
        vm.warp(resolutionDeadline);
        vm.prank(owner);
        oracle.resolveBet(0, "Team A");

        // Verify resolution
        (,,,,, bool resolved,,, string memory winningOutcome,) = market.getMarketInfo(0);
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
            QuintusMarket.MarketCategory.SPORTS
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
            QuintusMarket.MarketCategory.SPORTS
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
            QuintusMarket.MarketCategory.SPORTS
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
            QuintusMarket.MarketCategory.SPORTS
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

    function testLoserCannotClaim() public {
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
        QuintusMarket.MarketCategory.SPORTS
    );

    // User1 bets on winning outcome
    vm.prank(user1);
    market.placeBet{value: 1 ether}(0, "Team A");

    // User2 bets on losing outcome
    vm.prank(user2);
    market.placeBet{value: 1 ether}(0, "Team B");

    vm.warp(block.timestamp + 2 days + 1);
    vm.prank(owner);
    oracle.setBettingContract(address(market));
    vm.prank(owner);
    oracle.resolveBet(0, "Team A");

    // Loser attempts to claim
    vm.expectRevert(NoWinningsToClaim.selector);
    vm.prank(user2);
    market.claimWinnings(0);
    }

    function testCannotBetZeroAmount() public {
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
        QuintusMarket.MarketCategory.SPORTS
    );

    // Attempt to place bet with zero amount
    vm.expectRevert(BettingAmountCannotBeZero.selector);
    vm.prank(user2);
    market.placeBet{value: 0}(0, "Team A");
    }



    function testExactWinningCalculations() public {
    string[] memory outcomes = new string[](2);
    outcomes[0] = "Team A";
    outcomes[1] = "Team B";
    
    vm.prank(user1);
    market.createMarket{value: MARKET_CREATION_FEE}(
        "World Cup Final 2026",
        "Brazil vs Argentina",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        QuintusMarket.MarketCategory.SPORTS
    );

    vm.prank(user1);
    market.placeBet{value: 2 ether}(0, "Team A");
    
    vm.prank(user2);
    market.placeBet{value: 3 ether}(0, "Team A");

    uint256 user1BalanceBefore = user1.balance;
    uint256 user2BalanceBefore = user2.balance;

    vm.warp(block.timestamp + 2 days + 1);
    vm.prank(owner);
    oracle.setBettingContract(address(market));
    vm.prank(owner);
    oracle.resolveBet(0, "Team A");

    vm.prank(user1);
    market.claimWinnings(0);
    vm.prank(user2);
    market.claimWinnings(0);

    // User1 receives: 1.93 ETH + 0.02 ETH + 0.03 ETH (creator fees)
    assertEq(user1.balance - user1BalanceBefore, 1.98 ether);
    assertEq(user2.balance - user2BalanceBefore, 2.895 ether);
    }


    function testClaimingBeforeResolution() public {
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
        QuintusMarket.MarketCategory.SPORTS
    );

    vm.prank(user2);
    market.placeBet{value: 1 ether}(0, "Team A");

    // Try to claim before resolution
    vm.expectRevert(MarketNotResolved.selector);
    vm.prank(user2);
    market.claimWinnings(0);
    }

    function testBettingAfterDeadline() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 betDeadline = block.timestamp + 1 days;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Description",
            betDeadline,
            block.timestamp + 2 days,
            outcomes,
            QuintusMarket.MarketCategory.SPORTS
        );

        // Move time past betting deadline
        vm.warp(betDeadline + 1);

        // Attempt to place bet after deadline
        vm.expectRevert(BettingDeadlinePassed.selector);
        vm.prank(user2);
        market.placeBet{value: 1 ether}(0, "Team A");
    }

    function testResolutionBeforeDeadline() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        
        uint256 resolutionDeadline = block.timestamp + 2 days;
        
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Description",
            block.timestamp + 1 days,
            resolutionDeadline,
            outcomes,
            QuintusMarket.MarketCategory.SPORTS
        );

        vm.prank(owner);
        oracle.setBettingContract(address(market));

        // Try to resolve before deadline
        vm.expectRevert(TooEarlyToResolve.selector);
        market.resolveMarket(0);
    }

    function testDynamicPotentialWinnings() public {
    // Setup market
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
        QuintusMarket.MarketCategory.SPORTS
    );

    // User2 places initial bet
    vm.prank(user2);
    market.placeBet{value: 1 ether}(0, "Team A");
    
    // Initial potential winnings (1 ETH bet)
    uint256 initialPotential = market.calculatePotentialWinnings(0, user2);
    
    // User3 places larger bet on same outcome
    vm.prank(user3);
    market.placeBet{value: 2 ether}(0, "Team A");
    
    // Updated potential winnings after pool increase
    uint256 updatedPotential = market.calculatePotentialWinnings(0, user2);
    
    // Place bet on different outcome
    vm.prank(user1);
    market.placeBet{value: 3 ether}(0, "Team B");
    
    // Final potential winnings
    uint256 finalPotential = market.calculatePotentialWinnings(0, user2);

    // Calculate expected values
    uint256 totalPool = 6 ether;
    uint256 teamATotalBets = 3 ether;
    uint256 expectedWinnings = (1 ether * totalPool) / teamATotalBets;
    uint256 platformFee = (expectedWinnings * 25) / 1000;
    uint256 creatorFee = (expectedWinnings * 10) / 1000;
    uint256 expectedFinalPotential = expectedWinnings - platformFee - creatorFee;

    // Verify calculations
    assertEq(finalPotential, expectedFinalPotential);
    assertTrue(finalPotential > initialPotential);
    assertTrue(finalPotential > updatedPotential);
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
            QuintusMarket.MarketCategory.SPORTS
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

    function testGetMarketBets() public {
    // Setup market parameters
    string[] memory outcomes = new string[](2);
    outcomes[0] = "YES";
    outcomes[1] = "NO";
    
    // Create market with all required parameters
    market.createMarket{value: MARKET_CREATION_FEE}(
        "Test Market",
        "Test Description",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        QuintusMarket.MarketCategory.SPORTS
    );

    // Place bets
    vm.deal(address(this), 100 ether);
    market.placeBet{value: 60 ether}(0, "YES");
    
    vm.prank(address(0x1));
    vm.deal(address(0x1), 40 ether);
    market.placeBet{value: 40 ether}(0, "YES");

    // Test getting market bets
    (uint256 totalBets, uint256 weight) = market.getMarketBets(0, "YES");
    
    // Assertions
    assertEq(totalBets, 100 ether, "Total bets should be 100 ether");
    assertEq(weight, 100, "Weight should be 100%");
    }

    function testResolveMarket() public {
    // Setup market parameters
    string[] memory outcomes = new string[](2);
    outcomes[0] = "Team A";
    outcomes[1] = "Team B";
    
    uint256 betDeadline = block.timestamp + 1 days;
    uint256 resolutionDeadline = block.timestamp + 2 days;

    // Create market
    vm.prank(user1);
    market.createMarket{value: MARKET_CREATION_FEE}(
        "World Cup Final",
        "Who will win?",
        betDeadline,
        resolutionDeadline,
        outcomes,
        QuintusMarket.MarketCategory.SPORTS
    );

    // Place some bets
    vm.prank(user1);
    market.placeBet{value: 1 ether}(0, "Team A");
    
    vm.prank(user2);
    market.placeBet{value: 2 ether}(0, "Team B");

    // Move time past resolution deadline
    vm.warp(resolutionDeadline + 1);

    // Test resolveMarket emits correct event
    vm.expectEmit(true, true, true, true);
    emit MarketReadyForResolution(
        0,
        "World Cup Final",
        outcomes,
        3 ether,
        user1,
        QuintusMarket.MarketCategory.SPORTS
    );
    market.resolveMarket(0);
    }
    
    function testExactWinningsAndDoubleClaim() public {
    // Setup market
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
        QuintusMarket.MarketCategory.SPORTS
    );

    // Place bet
    uint256 betAmount = 10 ether;
    vm.prank(user2);
    market.placeBet{value: betAmount}(0, "Team A");

    // Calculate expected amounts
    uint256 expectedPlatformFee = (betAmount * 25) / 1000; // 2.5%
    uint256 expectedCreatorFee = (betAmount * 10) / 1000; // 1%
    uint256 expectedWinnings = betAmount - expectedPlatformFee - expectedCreatorFee;

    // Record initial balances
    uint256 ownerBalanceBefore = owner.balance;
    uint256 creatorBalanceBefore = user1.balance;
    uint256 betterBalanceBefore = user2.balance;

    // Resolve market
    vm.warp(block.timestamp + 2 days + 1);
    vm.prank(owner);
    oracle.setBettingContract(address(market));
    vm.prank(owner);
    oracle.resolveBet(0, "Team A");

    // First claim
    vm.prank(user2);
    market.claimWinnings(0);

    // Verify exact amounts
    assertEq(owner.balance - ownerBalanceBefore, expectedPlatformFee, "Platform fee incorrect");
    assertEq(user1.balance - creatorBalanceBefore, expectedCreatorFee, "Creator fee incorrect");
    assertEq(user2.balance - betterBalanceBefore, expectedWinnings, "Winner winnings incorrect");

    // Attempt second claim
    vm.expectRevert(AlreadyPaid.selector);
    vm.prank(user2);
    market.claimWinnings(0);
    }

    function testOnlyBettorsCanClaim() public {
    // Setup market
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
        QuintusMarket.MarketCategory.SPORTS
    );

    // User2 places bet
    vm.prank(user2);
    market.placeBet{value: 1 ether}(0, "Team A");

    // Resolve market
    vm.warp(block.timestamp + 2 days + 1);
    vm.prank(owner);
    oracle.setBettingContract(address(market));
    vm.prank(owner);
    oracle.resolveBet(0, "Team A");

    // User3 who never bet tries to claim
    vm.expectRevert(NoWinningsToClaim.selector);
    vm.prank(user3);
    market.claimWinnings(0);

    // Legitimate bettor can claim
    vm.prank(user2);
    market.claimWinnings(0);
    }




    function testGetMarketBetsWithMultipleOutcomes() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "YES";
        outcomes[1] = "NO";
        
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Test Market",
            "Test Description",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            QuintusMarket.MarketCategory.SPORTS
        );
        
        vm.deal(address(this), 75 ether);
        market.placeBet{value: 75 ether}(0, "YES");
        
        vm.prank(address(0x1));
        vm.deal(address(0x1), 25 ether);
        market.placeBet{value: 25 ether}(0, "NO");

        (uint256 yesBets, uint256 yesWeight) = market.getMarketBets(0, "YES");
        assertEq(yesBets, 75 ether, "YES bets should be 75 ether");
        assertEq(yesWeight, 75, "YES weight should be 75%");

        (uint256 noBets, uint256 noWeight) = market.getMarketBets(0, "NO");
        assertEq(noBets, 25 ether, "NO bets should be 25 ether");
        assertEq(noWeight, 25, "NO weight should be 25%");
    }


}
