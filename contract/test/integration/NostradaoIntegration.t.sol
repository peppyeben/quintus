// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/NostradaoMarket.sol";
import "../../src/NostradaoBettingOracles.sol";

contract NostradaoIntegrationTest is Test {
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
        
        // Setup oracle permissions
        oracle.setBettingContract(address(market));
        
        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
    }

    function testCompleteMarketFlow() public {
        // Create two different markets
        uint256 marketId1 = createSportsMarket();
        uint256 marketId2 = createCryptoMarket();
        
        // Users place bets on both markets
        placeBetsOnMarkets(marketId1, marketId2);
        
        // Time passes, markets reach resolution
        vm.warp(block.timestamp + 3 days);
        
        // Resolve markets
        resolveMarkets(marketId1, marketId2);
        
        // Users claim winnings
        claimWinningsAndVerify(marketId1, marketId2);
    }

    function createSportsMarket() internal returns (uint256) {
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
        
        return market.marketCount() - 1;
    }

    function createCryptoMarket() internal returns (uint256) {
        string[] memory outcomes = new string[](3);
        outcomes[0] = "Above 50k";
        outcomes[1] = "Below 40k";
        outcomes[2] = "Between 40k-50k";
        
        vm.prank(user2);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Bitcoin Price",
            "BTC price in 24h",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.CRYPTO
        );
        
        return market.marketCount() - 1;
    }

    function placeBetsOnMarkets(uint256 marketId1, uint256 marketId2) internal {
        // Bets on first market
        vm.prank(user1);
        market.placeBet{value: 2 ether}(marketId1, "Team A");
        
        vm.prank(user2);
        market.placeBet{value: 3 ether}(marketId1, "Team B");
        
        vm.prank(user3);
        market.placeBet{value: 1 ether}(marketId1, "Team A");
        
        // Bets on second market
        vm.prank(user1);
        market.placeBet{value: 1 ether}(marketId2, "Above 50k");
        
        vm.prank(user2);
        market.placeBet{value: 2 ether}(marketId2, "Between 40k-50k");
        
        vm.prank(user3);
        market.placeBet{value: 3 ether}(marketId2, "Above 50k");
    }

    function resolveMarkets(uint256 marketId1, uint256 marketId2) internal {
        vm.prank(owner);
        oracle.resolveBet(marketId1, "Team A");
        
        vm.prank(owner);
        oracle.resolveBet(marketId2, "Above 50k");
    }

    function testMultipleMarketsWithOverlappingUsers() public {
        uint256[] memory marketIds = new uint256[](3);
        marketIds[0] = createSportsMarket();
        marketIds[1] = createCryptoMarket();
        marketIds[2] = createPoliticsMarket();

        // Complex betting patterns
        simulateComplexBettingPatterns(marketIds);
        
        // Time progression and market resolutions
        vm.warp(block.timestamp + 3 days);
        resolveMarketsInSequence(marketIds);
        
        // Verify complex winning distributions
        verifyComplexWinningDistributions(marketIds);
    }

    function createPoliticsMarket() internal returns (uint256) {
        string[] memory outcomes = new string[](4);
        outcomes[0] = "Candidate A";
        outcomes[1] = "Candidate B";
        outcomes[2] = "Candidate C";
        outcomes[3] = "No Winner";
        
        vm.prank(user3);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Election Results",
            "Who wins the election?",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.POLITICS
        );
        
        return market.marketCount() - 1;
    }

    function simulateComplexBettingPatterns(uint256[] memory marketIds) internal {
        // User1 bets on all markets
        vm.startPrank(user1);
        market.placeBet{value: 1 ether}(marketIds[0], "Team A");
        market.placeBet{value: 2 ether}(marketIds[1], "Above 50k");
        market.placeBet{value: 1.5 ether}(marketIds[2], "Candidate A");
        vm.stopPrank();

        // User2 bets on specific markets
        vm.startPrank(user2);
        market.placeBet{value: 3 ether}(marketIds[0], "Team B");
        market.placeBet{value: 2.5 ether}(marketIds[2], "Candidate B");
        vm.stopPrank();

        // User3 focuses on one market
        vm.prank(user3);
        market.placeBet{value: 5 ether}(marketIds[1], "Above 50k");
    }

    function resolveMarketsInSequence(uint256[] memory marketIds) internal {
        vm.startPrank(owner);
        oracle.resolveBet(marketIds[0], "Team A");
        oracle.resolveBet(marketIds[1], "Above 50k");
        oracle.resolveBet(marketIds[2], "Candidate B");
        vm.stopPrank();
    }

    function verifyComplexWinningDistributions(uint256[] memory marketIds) internal {
        uint256[] memory initialBalances = new uint256[](3);
        initialBalances[0] = user1.balance;
        initialBalances[1] = user2.balance;
        initialBalances[2] = user3.balance;

        // Users claim from their winning markets
        vm.prank(user1);
        market.claimWinnings(marketIds[0]); // Won Team A
        
        vm.prank(user1);
        market.claimWinnings(marketIds[1]); // Won Above 50k
        
        vm.prank(user2);
        market.claimWinnings(marketIds[2]); // Won Candidate B
        
        vm.prank(user3);
        market.claimWinnings(marketIds[1]); // Won Above 50k

        // Verify balances increased appropriately
        assertTrue(user1.balance > initialBalances[0]);
        assertTrue(user2.balance > initialBalances[1]);
        assertTrue(user3.balance > initialBalances[2]);
        
        // Verify specific balance changes
        assertGt(user1.balance - initialBalances[0], 3 ether); // Won 2 markets
        assertGt(user2.balance - initialBalances[1], 2 ether); // Won 1 market
        assertGt(user3.balance - initialBalances[2], 4 ether); // Won big on 1 market
    }

    function placeDiversifiedBets(uint256 marketId) internal {
        vm.prank(user1);
        market.placeBet{value: 1 ether}(marketId, "Team A");
        
        vm.prank(user2);
        market.placeBet{value: 2 ether}(marketId, "Team B");
        
        vm.prank(user3);
        market.placeBet{value: 1.5 ether}(marketId, "Team A");
    }

    function verifyRefundsAfterCancellation(uint256 marketId) internal {
        uint256[] memory initialBalances = new uint256[](3);
        initialBalances[0] = user1.balance;
        initialBalances[1] = user2.balance;
        initialBalances[2] = user3.balance;

        vm.prank(user1);
        market.claimWinnings(marketId);
        
        vm.prank(user2);
        market.claimWinnings(marketId);
        
        vm.prank(user3);
        market.claimWinnings(marketId);

        assertEq(user1.balance - initialBalances[0], 1 ether);
        assertApproxEqAbs(user1.balance - initialBalances[0], 1 ether, 0.01 ether);
        assertApproxEqAbs(user2.balance - initialBalances[1], 2 ether, 0.01 ether);
        assertApproxEqAbs(user3.balance - initialBalances[2], 1.5 ether, 0.01 ether);
    }


    function claimWinningsAndVerify(uint256 marketId1, uint256 marketId2) internal {
        // Record initial balances
        uint256 user1BalanceBefore = user1.balance;
        uint256 user3BalanceBefore = user3.balance;
        
        // Claim winnings from first market
        vm.prank(user1);
        market.claimWinnings(marketId1);
        
        vm.prank(user3);
        market.claimWinnings(marketId1);
        
        // Claim winnings from second market
        vm.prank(user1);
        market.claimWinnings(marketId2);
        
        vm.prank(user3);
        market.claimWinnings(marketId2);
        
        // Verify winners received more than their initial balance
        assertTrue(user1.balance > user1BalanceBefore);
        assertTrue(user3.balance > user3BalanceBefore);
        
        // Verify loser (user2) can't claim
        vm.expectRevert();
        vm.prank(user2);
        market.claimWinnings(marketId1);
    }

    receive() external payable {}
}
