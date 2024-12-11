// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/NostradaoMarket.sol";
import "../../src/NostradaoOracle.sol";



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
    // Setup resolved market with more explicit bet scenario
    testMarketCreation();
    
    // Multiple users place bets
    vm.startPrank(user1);
    vm.deal(user1, 1 ether);
    market.placeBet{value: 0.3 ether}(0, 1);
    vm.stopPrank();

    vm.startPrank(user2);
    vm.deal(user2, 1 ether);
    market.placeBet{value: 0.5 ether}(0, 1);
    vm.stopPrank();
    
    // Advance time and resolve market
    vm.warp(block.timestamp + 2 days);
    
    vm.startPrank(owner);
    oracle.resolveMarket(0, 1);
    vm.stopPrank();
    
    // Debug: Print market details
    uint256 totalMarketBets = market.getMarketBets(0, 1);
    console.log("Total Market Bets:", totalMarketBets);
    
    uint256 initialBalance = user2.balance;
    
    vm.startPrank(user2);
    market.claimWinnings(0);
    
    uint256 finalBalance = user2.balance;
    console.log("Initial Balance:", initialBalance);
    console.log("Final Balance:", finalBalance);
    
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

    function testFailBetAfterDeadline() public {
    testMarketCreation();
    vm.warp(block.timestamp + 1 days + 1); // After deadline

    vm.startPrank(user1);
    vm.deal(user1, 1 ether);

    market.placeBet{value: 0.5 ether}(0, 1); // Should fail
    vm.stopPrank();
    }
    
    function testFailZeroValueBet() public {
    testMarketCreation();

    vm.startPrank(user1);
    vm.deal(user1, 1 ether);

    market.placeBet{value: 0 ether}(0, 1); // Should fail
    vm.stopPrank();
    }
    function testFailDoubleClaim() public {
    testClaimWinnings();

    // User2 claims winnings again
    vm.startPrank(user2);
    market.claimWinnings(0); // Should fail
    vm.stopPrank();
    }

    function testCreatorFeeReceived() public {
    testClaimWinnings();
    
    uint256 totalPool = 0.8 ether;
    uint256 userBetAmount = 0.5 ether;
    uint256 winnings = (userBetAmount * totalPool) / totalPool;
    uint256 expectedCreatorFee = (winnings * market.CREATOR_FEE()) / 1000;
    
    // Creator should receive 0.705 ETH (0.7 ETH bet + 0.005 ETH fee)
    assertEq(user1.balance, 705000000000000000);
}

function testPayoutCalculation() public {
    testClaimWinnings();

    uint256 totalPool = 0.8 ether;
    uint256 userBetAmount = 0.5 ether;
    uint256 winnings = (userBetAmount * totalPool) / totalPool;
    uint256 platformFee = (winnings * market.PLATFORM_FEE()) / 1000;
    uint256 creatorFee = (winnings * market.CREATOR_FEE()) / 1000;
    uint256 expectedPayout = winnings - platformFee - creatorFee;

    // User2 should receive 0.9825 ETH (original bet + winnings - fees)
    assertEq(user2.balance, 982500000000000000);
}
    function testFailNoWinningsToClaim() public {
    testClaimWinnings();

    vm.startPrank(user2);
    market.claimWinnings(0); // No bets on winning outcome
    vm.stopPrank();
    }


    function testFeeCalculations() public {
    uint256 totalWinnings = 1000 ether;

    uint256 platformFee = (totalWinnings * 25) / 1000; // 2.5%
    uint256 creatorFee = (totalWinnings * 10) / 1000;  // 1%
    uint256 finalWinnings = totalWinnings - platformFee - creatorFee;

    assertEq(platformFee, 25 ether, "Platform fee incorrect");
    assertEq(creatorFee, 10 ether, "Creator fee incorrect");
    assertEq(finalWinnings, 965 ether, "Final winnings incorrect");
    }

    function testMultipleMarketsCreation() public {
    vm.startPrank(user1);
    vm.deal(user1, 2 ether);
    
    uint256[] memory outcomes = new uint256[](2);
    outcomes[0] = 1;
    outcomes[1] = 2;
    
    // Create first market
    market.createMarket{value: 0.01 ether}(
        "Market 1",
        "First market description",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        NostradaoMarket.MarketCategory.SPORTS
    );
    
    // Create second market
    market.createMarket{value: 0.01 ether}(
        "Market 2",
        "Second market description",
        block.timestamp + 3 days,
        block.timestamp + 4 days,
        outcomes,
        NostradaoMarket.MarketCategory.CRYPTO
    );
    
    assertEq(market.marketCount(), 2);
    vm.stopPrank();
    }

    function testMultipleUsersBetting() public {
    testMarketCreation();
    
    address user3 = address(4);
    address user4 = address(5);
    
    // User2 bets
    vm.startPrank(user2);
    vm.deal(user2, 1 ether);
    market.placeBet{value: 0.2 ether}(0, 1);
    vm.stopPrank();
    
    // User3 bets
    vm.startPrank(user3);
    vm.deal(user3, 1 ether);
    market.placeBet{value: 0.3 ether}(0, 1);
    vm.stopPrank();
    
    // User4 bets
    vm.startPrank(user4);
    vm.deal(user4, 1 ether);
    market.placeBet{value: 0.4 ether}(0, 2);
    vm.stopPrank();
    
    assertEq(market.getMarketBets(0, 1), 0.5 ether);
    assertEq(market.getMarketBets(0, 2), 0.4 ether);
    }

    function testFailInsufficientCreationFee() public {
    vm.startPrank(user1);
    vm.deal(user1, 1 ether);
    
    uint256[] memory outcomes = new uint256[](2);
    outcomes[0] = 1;
    outcomes[1] = 2;
    
    market.createMarket{value: 0.005 ether}(
        "Will fail",
        "Insufficient fee",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        NostradaoMarket.MarketCategory.OTHERS
    );
    vm.stopPrank();
    }

    function testMarketInfoRetrieval() public {
    testMarketCreation();
    
    (
        string memory title,
        string memory description,
        uint256 deadline,
        uint256 resolutionTime,
        address creator,
        bool resolved,
        uint256[] memory outcomes,
        uint256 winningOutcome,
        NostradaoMarket.MarketCategory category
    ) = market.getMarketInfo(0);
    
    assertEq(title, "Will ETH reach $5000?");
    assertEq(description, "Price prediction for ETH");
    assertEq(creator, user1);
    assertFalse(resolved);
    assertEq(outcomes.length, 2);
    assertEq(uint(category), uint(NostradaoMarket.MarketCategory.CRYPTO));
    }

    function testMultipleOutcomes() public {
    vm.startPrank(user1);
    vm.deal(user1, 1 ether);
    
    uint256[] memory outcomes = new uint256[](4);
    outcomes[0] = 1;
    outcomes[1] = 2;
    outcomes[2] = 3;
    outcomes[3] = 4;
    
    market.createMarket{value: 0.01 ether}(
        "Multiple outcomes",
        "Market with 4 possible outcomes",
        block.timestamp + 1 days,
        block.timestamp + 2 days,
        outcomes,
        NostradaoMarket.MarketCategory.POLITICS
    );
    
    (, , , , , , uint256[] memory marketOutcomes, , ) = market.getMarketInfo(0);
    assertEq(marketOutcomes.length, 4);
    vm.stopPrank();
    }

}

