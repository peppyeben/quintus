// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WagerOracle.sol";

/// @title P2PWager - Peer-to-peer betting contract
/// @notice Manages direct wagers between two parties
contract P2PWager {
    // === State Variables ===
    WagerOracle public immutable oracle;

    struct Wager {
        address creator;          // Address of the wager creator
        address counterparty;     // Address of the wager acceptor
        uint256 amount;           // Amount wagered by each party
        string topic;             // Topic of the wager
        string condition;         // Condition to be resolved
        uint256 deadline;         // Deadline for the wager
        bool resolved;            // Whether the wager is resolved
        bool creatorWins;         // Outcome of the wager
    }

    mapping(bytes32 => Wager) public wagers; // Mapping of wager IDs to Wager structs

    // === Events ===
    event WagerCreated(
        bytes32 indexed wagerId,
        address indexed creator,
        string topic,
        string condition,
        uint256 amount
    );
    event WagerAccepted(bytes32 indexed wagerId, address indexed counterparty);
    event WagerResolved(bytes32 indexed wagerId, address winner);

    // === Constructor ===
    constructor(address _oracle) {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = WagerOracle(_oracle);
    }

    // === External Functions ===

    function createWager(
        string calldata topic,
        string calldata condition,
        uint256 deadline
    ) external payable returns (bytes32) {
        require(msg.value > 0, "Must wager some BNB");
        require(deadline > block.timestamp, "Invalid deadline");

        bytes32 wagerId = keccak256(
            abi.encodePacked(msg.sender, topic, condition, block.timestamp)
        );

        wagers[wagerId] = Wager({
            creator: msg.sender,
            counterparty: address(0),
            amount: msg.value,
            topic: topic,
            condition: condition,
            deadline: deadline,
            resolved: false,
            creatorWins: false
        });

        emit WagerCreated(wagerId, msg.sender, topic, condition, msg.value);
        return wagerId;
    }

    function acceptWager(bytes32 wagerId) external payable {
        Wager storage wager = wagers[wagerId];
        require(wager.creator != address(0), "Wager doesn't exist");
        require(wager.counterparty == address(0), "Already accepted");
        require(msg.value == wager.amount, "Must match wager amount");

        wager.counterparty = msg.sender;

        emit WagerAccepted(wagerId, msg.sender);
    }

    function resolveWager(bytes32 wagerId) external {
        Wager storage wager = wagers[wagerId];
        require(!wager.resolved, "Already resolved");
        require(block.timestamp > wager.deadline, "Too early");
        require(wager.counterparty != address(0), "Not accepted");

        oracle.requestResolution(wagerId, wager.topic, wager.condition);
    }

    function finalizeWager(bytes32 wagerId) external {
        Wager storage wager = wagers[wagerId];
        require(!wager.resolved, "Already resolved");

        (bool processed, bool result) = oracle.getResolution(wagerId);
        require(processed, "Not processed by oracle");

        wager.resolved = true;
        wager.creatorWins = result;

        address winner = result ? wager.creator : wager.counterparty;
        uint256 payout = wager.amount * 2;

        (bool success, ) = payable(winner).call{value: payout}("");
        require(success, "Transfer failed");

        emit WagerResolved(wagerId, winner);
    }

    /**
     * @notice Retrieves the full details of a wager.
     * @param wagerId The ID of the wager to retrieve.
     * @return The full Wager struct.
     */
    function getWager(bytes32 wagerId) external view returns (Wager memory) {
        return wagers[wagerId];
    }
}
