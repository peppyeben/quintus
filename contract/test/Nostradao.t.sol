// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Nostradao.sol";

contract NostradaoTest is Test {
    Nostradao public nostradao;
    address oracle = address(0x1);
    address feeCollector = address(0x2);

    function setUp() public {
        nostradao = new Nostradao(oracle, feeCollector);
    }

    function testRegisterUser() public {
        nostradao.registerUser("Alice");
        (address userAddress, string memory name) = nostradao.users(address(this));
        assertEq(userAddress, address(this));
        assertEq(name, "Alice");
    }

    function testCannotRegisterUserTwice() public {
        nostradao.registerUser("Alice");
        vm.expectRevert("User already registered");
        nostradao.registerUser("Alice");
    }

    function testCreateMarket() public {
        // Properly declare arrays first
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Outcome1";
        outcomes[1] = "Outcome2";

        address[] memory oracleList = new address[](1);
        oracleList[0] = oracle;

        nostradao.createMarket(
            "Market Title",
            "Description",
            Nostradao.Category.Sports,
            oracleList,
            outcomes,
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            oracle
        );

        address[] memory markets = nostradao.getAllMarkets();
        assertEq(markets.length, 1);
    }

    function testCannotCreateMarketWithInvalidParams() public {
        // Create empty outcomes array to test invalid case
        string[] memory outcomes = new string[](0);
        
        address[] memory oracleList = new address[](1);
        oracleList[0] = oracle;

        vm.expectRevert("There must be at least two outcomes");
        nostradao.createMarket(
            "Market Title",
            "Description",
            Nostradao.Category.Sports,
            oracleList,
            outcomes,
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            oracle
        );
    }
}
