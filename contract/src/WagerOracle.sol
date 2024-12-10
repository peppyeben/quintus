// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WagerOracle - Oracle contract for resolving wagers
/// @notice Provides external data verification for betting outcomes
contract WagerOracle {
    // === State Variables ===
    address public immutable owner;
    address public wagerContract;

    struct Resolution {
        bool isProcessed; // Whether the resolution has been completed
        bool result;      // The outcome of the wager
        string dataSource1; // First data source used for resolution
        string dataSource2; // Second data source used for resolution
    }

    mapping(bytes32 => Resolution) public resolutions; // Mapping from wager ID to resolution

    // === Events ===
    event ResolutionRequested(
        bytes32 indexed wagerId,
        string topic,
        string condition,
        uint256 timestamp
    );

    event ResolutionProvided(
        bytes32 indexed wagerId,
        bool result,
        string dataSource1,
        string dataSource2
    );

    // === Modifiers ===
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier onlyWagerContract() {
        require(msg.sender == wagerContract, "Only wager contract can call");
        _;
    }

    // === Constructor ===
    constructor() {
        owner = msg.sender;
    }

    // === External Functions ===
    /**
     * @notice Sets the wager contract address that can interact with this oracle.
     * @param _wagerContract Address of the wager contract.
     */
    function setWagerContract(address _wagerContract) external onlyOwner {
        require(_wagerContract != address(0), "Invalid wager contract address");
        wagerContract = _wagerContract;
    }

    /**
     * @notice Requests a resolution for a given wager.
     * @param wagerId The unique identifier of the wager.
     * @param topic The topic of the wager.
     * @param condition The condition to resolve.
     */
    function requestResolution(
        bytes32 wagerId,
        string calldata topic,
        string calldata condition
    ) external onlyWagerContract {
        require(!resolutions[wagerId].isProcessed, "Wager already processed");
        emit ResolutionRequested(wagerId, topic, condition, block.timestamp);
    }

    /**
     * @notice Provides the resolution for a wager.
     * @param wagerId The unique identifier of the wager.
     * @param result The resolution result (true/false).
     * @param dataSource1 The primary data source used for resolution.
     * @param dataSource2 The secondary data source used for resolution.
     */
    function provideResolution(
        bytes32 wagerId,
        bool result,
        string calldata dataSource1,
        string calldata dataSource2
    ) external onlyOwner {
        require(!resolutions[wagerId].isProcessed, "Wager already processed");
        resolutions[wagerId] = Resolution({
            isProcessed: true,
            result: result,
            dataSource1: dataSource1,
            dataSource2: dataSource2
        });
        emit ResolutionProvided(wagerId, result, dataSource1, dataSource2);
    }

    // === View Functions ===
    /**
     * @notice Retrieves the resolution status and result for a wager.
     * @param wagerId The unique identifier of the wager.
     * @return isProcessed Whether the resolution has been processed.
     * @return result The resolution result (true/false).
     */
    function getResolution(bytes32 wagerId) external view returns (bool isProcessed, bool result) {
        Resolution storage resolution = resolutions[wagerId];
        return (resolution.isProcessed, resolution.result);
    }
}