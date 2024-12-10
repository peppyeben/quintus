// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/WagerOracle.sol";

contract WagerOracleTest is Test {
    WagerOracle public oracle;

    function setUp() public {
        oracle = new WagerOracle();
    }

    function testSetWagerContract() public {
        address wagerContract = address(0x123);
        oracle.setWagerContract(wagerContract);
        assertEq(oracle.wagerContract(), wagerContract);
    }

    function testCannotSetWagerContractToZero() public {
        vm.expectRevert("Invalid wager contract address");
        oracle.setWagerContract(address(0));
    }

    function testRequestResolution() public {
        // 1. Set wager contract
        address wagerContract = address(0x123);
        vm.prank(oracle.owner());
        oracle.setWagerContract(wagerContract);
        
        // 2. Create test data
        bytes32 wagerId = keccak256(abi.encodePacked("WagerID"));
        
        // 3. Call as wager contract
        vm.prank(wagerContract);
        oracle.requestResolution(wagerId, "Topic", "Condition");
    }

    function testProvideResolution() public {
        bytes32 wagerId = keccak256(abi.encodePacked("WagerID"));
        oracle.provideResolution(wagerId, true, "DataSource1", "DataSource2");

        (bool isProcessed, bool result) = oracle.getResolution(wagerId);
        assertTrue(isProcessed);
        assertTrue(result);
    }
}
