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
    address public user4;
    uint256 public constant MARKET_CREATION_FEE = 0.01 ether;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        user4 = makeAddr("user4");

        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
        vm.deal(user4, 100 ether);

        oracle = new NostradaoBettingOracle();
        market = new NostradaoMarket(address(oracle));
        oracle.setBettingContract(address(market));
    }

    function testMarketCreationWithInvalidParameters() public {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";

        // Test past deadline
        vm.expectRevert();
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            "Invalid Market",
            "Description",
            block.timestamp - 1,
            block.timestamp + 1,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );

        // Test insufficient fee
        vm.expectRevert();
        vm.prank(user1);
        market.createMarket{value: 0.005 ether}(
            "Invalid Market",
            "Description",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            NostradaoMarket.MarketCategory.SPORTS
        );
    }

    function testMultipleMarketsMultipleCategories() public {
        uint256[] memory marketIds = new uint256[](4);
        
        // Create markets across different categories
        marketIds[0] = createSportsMarket();
        marketIds[1] = createCryptoMarket();
        marketIds[2] = createPoliticsMarket();
        marketIds[3] = createElectionMarket();

        // Place diverse bets
        placeDiversifiedBets(marketIds);

        // Progress time and resolve
        vm.warp(block.timestamp + 3 days);
        resolveAllMarkets(marketIds);

        // Verify outcomes
        verifyMarketResolutions(marketIds);
    }

    function testOracleAuthorization() public {
        // Test unauthorized resolution
        vm.prank(user1);
        vm.expectRevert();
        oracle.resolveBet(0, "Any Outcome");

        // Test authorized resolution
        vm.prank(owner);
        oracle.addAuthorizedWallet(user1);
        
        vm.prank(user1);
        oracle.resolveBet(0, "Valid Outcome");
    }

    function testMarketFeesAndRewards() public {
        uint256 marketId = createSportsMarket();
        
        // Track initial balances
        uint256 initialCreatorBalance = user1.balance;
        uint256 initialPlatformBalance = owner.balance;

        // Place significant bets
        vm.prank(user2);
        market.placeBet{value: 10 ether}(marketId, "Team A");
        
        vm.prank(user3);
        market.placeBet{value: 5 ether}(marketId, "Team B");

        // Resolve and distribute
        vm.warp(block.timestamp + 3 days);
        vm.prank(owner);
        oracle.resolveBet(marketId, "Team A");

        // Claim winnings
        vm.prank(user2);
        market.claimWinnings(marketId);

        // Verify fee distribution
        assertGt(user1.balance, initialCreatorBalance); // Creator fee
        assertGt(owner.balance, initialPlatformBalance); // Platform fee
    }

    // Helper functions
    function createSportsMarket() internal returns (uint256) {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Team A";
        outcomes[1] = "Team B";
        return createMarket("Sports", NostradaoMarket.MarketCategory.SPORTS, outcomes);
    }

    function createCryptoMarket() internal returns (uint256) {
        string[] memory outcomes = new string[](3);
        outcomes[0] = "Bull";
        outcomes[1] = "Bear";
        outcomes[2] = "Neutral";
        return createMarket("Crypto", NostradaoMarket.MarketCategory.CRYPTO, outcomes);
    }

    function createPoliticsMarket() internal returns (uint256) {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        return createMarket("Politics", NostradaoMarket.MarketCategory.POLITICS, outcomes);
    }

    function createElectionMarket() internal returns (uint256) {
        string[] memory outcomes = new string[](4);
        outcomes[0] = "Candidate A";
        outcomes[1] = "Candidate B";
        outcomes[2] = "Candidate C";
        outcomes[3] = "Candidate D";
        return createMarket("Election", NostradaoMarket.MarketCategory.ELECTION, outcomes);
    }

    function placeDiversifiedBets(uint256[] memory marketIds) internal {
        for (uint256 i = 0; i < marketIds.length; i++) {
            vm.prank(user2);
            market.placeBet{value: 2 ether}(marketIds[i], getFirstOutcome(marketIds[i]));
            
            vm.prank(user3);
            market.placeBet{value: 3 ether}(marketIds[i], getSecondOutcome(marketIds[i]));
        }
    }

    function getFirstOutcome(uint256 marketId) internal view returns (string memory) {
        (,,,,,, string[] memory outcomes,,) = market.getMarketInfo(marketId);
        return outcomes[0];
    }

    function getSecondOutcome(uint256 marketId) internal view returns (string memory) {
        (,,,,,, string[] memory outcomes,,) = market.getMarketInfo(marketId);
        return outcomes[1];
    }

    function resolveAllMarkets(uint256[] memory marketIds) internal {
        vm.startPrank(owner);
        for (uint256 i = 0; i < marketIds.length; i++) {
            oracle.resolveBet(marketIds[i], getFirstOutcome(marketIds[i]));
        }
        vm.stopPrank();
    }

    function verifyMarketResolutions(uint256[] memory marketIds) internal {
        for (uint256 i = 0; i < marketIds.length; i++) {
            (,,,,, bool resolved,, string memory outcome,) = market.getMarketInfo(marketIds[i]);
            assertTrue(resolved);
            assertEq(outcome, getFirstOutcome(marketIds[i]));
        }
    }

        function createMarket(
        string memory category, 
        NostradaoMarket.MarketCategory marketCategory, 
        string[] memory outcomes
    ) internal returns (uint256) {
        vm.prank(user1);
        market.createMarket{value: MARKET_CREATION_FEE}(
            string.concat(category, " Market"),
            "Description",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            outcomes,
            marketCategory
        );
        return market.marketCount() - 1;
    }
        

    receive() external payable {}
}
