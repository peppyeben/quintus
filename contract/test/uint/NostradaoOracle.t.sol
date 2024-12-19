// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/NostradaoMarket.sol";
import "../../src/NostradaoBettingOracles.sol";

contract NostradaoBettingOracleTest is Test {
    NostradaoBettingOracle public oracle;
    NostradaoMarket public market;
    address public authorizedWallet1;
    address public authorizedWallet2;
    address public unauthorizedWallet;

    
    event BettingContractUpdated(address indexed newBettingContract);
    event BetResolved(uint256 indexed marketId, string winningOutcome);
    event WalletAuthorized(address indexed wallet);
    event WalletDeauthorized(address indexed wallet);

    function setUp() public {
        authorizedWallet1 = makeAddr("authorized1");
        authorizedWallet2 = makeAddr("authorized2");
        unauthorizedWallet = makeAddr("unauthorized");
        
        vm.prank(authorizedWallet1);
        oracle = new NostradaoBettingOracle();
        market = new NostradaoMarket(address(oracle));
    }

    function testCompleteOracleLifecycle() public {
        // Test authorization management
        vm.startPrank(authorizedWallet1);
        oracle.addAuthorizedWallet(authorizedWallet2);
        assertTrue(oracle.authorizedWallets(authorizedWallet2));
        
        oracle.setBettingContract(address(market));
        assertEq(oracle.bettingContract(), address(market));
        vm.stopPrank();

        // Test resolution by different authorized wallets
        vm.prank(authorizedWallet1);
        oracle.resolveBet(0, "Team A");
        assertEq(oracle.getWinningOutcome(0), "Team A");

        vm.prank(authorizedWallet2);
        oracle.resolveBet(1, "Team B");
        assertEq(oracle.getWinningOutcome(1), "Team B");

        // Test authorization removal
        vm.prank(authorizedWallet1);
        oracle.removeAuthorizedWallet(authorizedWallet2);
        assertFalse(oracle.authorizedWallets(authorizedWallet2));
    }

    function testUnauthorizedAccess() public {
        vm.startPrank(unauthorizedWallet);
        
        vm.expectRevert(NostradaoBettingOracle.NotAuthorized.selector);
        oracle.setBettingContract(address(market));

        vm.expectRevert(NostradaoBettingOracle.NotAuthorized.selector);
        oracle.resolveBet(0, "Team A");

        vm.expectRevert(NostradaoBettingOracle.NotAuthorized.selector);
        oracle.addAuthorizedWallet(unauthorizedWallet);
        
        vm.stopPrank();
    }

    function testDoubleResolution() public {
        vm.startPrank(authorizedWallet1);
        oracle.setBettingContract(address(market));
        oracle.resolveBet(0, "Team A");
        
        vm.expectRevert(NostradaoBettingOracle.BetMarketAlreadyResolved.selector);
        oracle.resolveBet(0, "Team B");
        vm.stopPrank();
    }

    function testResolutionWithoutContract() public {
        vm.startPrank(authorizedWallet1);
        
        vm.expectRevert(NostradaoBettingOracle.BettingContractNotSet.selector);
        oracle.resolveBet(1, "Team A");
        vm.stopPrank();
    }


    function testEventEmissions() public {
        vm.startPrank(authorizedWallet1);
        
        // Test BettingContractUpdated event
        vm.expectEmit(true, false, false, false);
        emit BettingContractUpdated(address(market));
        oracle.setBettingContract(address(market));

        // Test WalletAuthorized event
        vm.expectEmit(true, false, false, false);
        emit WalletAuthorized(authorizedWallet2);
        oracle.addAuthorizedWallet(authorizedWallet2);

        // Test BetResolved event
        vm.expectEmit(true, false, false, true);
        emit BetResolved(0, "Team A");
        oracle.resolveBet(0, "Team A");

        // Test WalletDeauthorized event
        vm.expectEmit(true, false, false, false);
        emit WalletDeauthorized(authorizedWallet2);
        oracle.removeAuthorizedWallet(authorizedWallet2);
        
        vm.stopPrank();
    }
}
