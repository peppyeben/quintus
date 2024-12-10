// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/P2PWager.sol";
import "../src/WagerOracle.sol";

contract P2PWagerTest is Test {
    WagerOracle public oracle;
    P2PWager public wager;

    address public creator = address(0x123);
    address public counterparty = address(0x456);

    function setUp() public {
        oracle = new WagerOracle();
        wager = new P2PWager(address(oracle));
        
        // Set wager contract in oracle
        vm.prank(oracle.owner());
        oracle.setWagerContract(address(wager));
    }

    function testCreateWager() public {
        // Creator creates a wager
        vm.prank(creator);
        bytes32 wagerId = wager.createWager{value: 1 ether}("Topic", "Condition", block.timestamp + 1 days);
        
        // Fetch the created wager from the contract using the new getter
        P2PWager.Wager memory createdWager = wager.getWager(wagerId);

        // Verify the wager data
        assertEq(createdWager.creator, creator);
        assertEq(createdWager.amount, 1 ether);
        assertEq(createdWager.topic, "Topic");
        assertEq(createdWager.condition, "Condition");
        assertEq(createdWager.deadline, block.timestamp + 1 days);
        assertFalse(createdWager.resolved);
    }

    function testAcceptWager() public {
        // Create a wager
        vm.prank(creator);
        bytes32 wagerId = wager.createWager{value: 1 ether}("Topic", "Condition", block.timestamp + 1 days);

        // Counterparty accepts the wager
        vm.prank(counterparty);
        wager.acceptWager{value: 1 ether}(wagerId);

        // Fetch the accepted wager from the contract using the new getter
        P2PWager.Wager memory acceptedWager = wager.getWager(wagerId);

        // Verify the counterparty has been set correctly
        assertEq(acceptedWager.counterparty, counterparty);
    }

    function testResolveWager() public {
        // Create a wager
        vm.prank(creator);
        bytes32 wagerId = wager.createWager{value: 1 ether}("Topic", "Condition", block.timestamp + 1 days);

        // Counterparty accepts the wager
        vm.prank(counterparty);
        wager.acceptWager{value: 1 ether}(wagerId);

        // Warp to the deadline time and resolve the wager
        vm.warp(block.timestamp + 2 days);
        vm.prank(creator);
        wager.resolveWager(wagerId);

        // Simulate oracle resolution
        vm.startPrank(address(oracle));
        oracle.provideResolution(wagerId, true, "DataSource1", "DataSource2");  // Mocking oracle resolution
        vm.stopPrank();

        // Finalize the wager
        vm.startPrank(creator);
        wager.finalizeWager(wagerId);
        vm.stopPrank();

        // Fetch the finalized wager from the contract using the new getter
        P2PWager.Wager memory resolvedWager = wager.getWager(wagerId);

        // Verify that the wager is marked as resolved
        assertTrue(resolvedWager.resolved);
        assertTrue(resolvedWager.creatorWins);
    }

    function testFinalizeWagerWithLoser() public {
        // Create a wager
        vm.prank(creator);
        bytes32 wagerId = wager.createWager{value: 1 ether}("Topic", "Condition", block.timestamp + 1 days);

        // Counterparty accepts the wager
        vm.prank(counterparty);
        wager.acceptWager{value: 1 ether}(wagerId);

        // Warp to the deadline time and resolve the wager
        vm.warp(block.timestamp + 2 days);
        vm.prank(creator);
        wager.resolveWager(wagerId);

        // Simulate oracle resolution where counterparty wins
        vm.startPrank(address(oracle));
        oracle.provideResolution(wagerId, false, "DataSource1", "DataSource2");  // Mocking oracle resolution
        vm.stopPrank();

        // Finalize the wager
        vm.startPrank(counterparty);
        wager.finalizeWager(wagerId);
        vm.stopPrank();

        // Fetch the finalized wager from the contract using the new getter
        P2PWager.Wager memory resolvedWager = wager.getWager(wagerId);

        // Verify that the wager is marked as resolved and the counterparty wins
        assertTrue(resolvedWager.resolved);
        assertFalse(resolvedWager.creatorWins);
    }
}
