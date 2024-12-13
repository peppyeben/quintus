// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title IBetMarket - Interface for NostradaoMarket contract
/// @notice This interface defines the function that allows the oracle to notify the market contract when a market is resolved
interface IBetMarket {
    /// @notice Resolves a market with the winning outcome determined by the oracle
    /// @param _marketId The ID of the market to resolve
    /// @param _outcome The winning outcome
    function resolveBet(uint256 _marketId, string memory _outcome) external;
}


/// @title NostradaoBettingOracle - Oracle contract for resolving betting markets
/// @notice This contract provides oracle services to resolve betting markets and communicate outcomes
contract NostradaoBettingOracle is Ownable {
    address public bettingContract;

    // Mapping to store resolved outcomes for each betting market
    mapping(uint256 => string) private resolvedOutcomes; // Storing resolved outcomes

    // Custom errors for gas optimization
    error BettingContractNotSet();
    error BetMarketAlreadyResolved();

    // Events
    event BettingContractUpdated(address indexed newBettingContract);
    event BetResolved(uint256 indexed marketId, string winningOutcome);

    constructor() Ownable(msg.sender) {}

    /// @notice Updates the address of the betting contract
    /// @param _bettingContract Address of the NostradaoMarket contract
    function setBettingContract(address _bettingContract) external onlyOwner {
        bettingContract = _bettingContract;
        emit BettingContractUpdated(_bettingContract);
    }

    /// @notice Resolves a betting market and informs the betting contract of the winning outcome
    /// @param _marketId ID of the betting market to resolve
    /// @param _outcome Winning outcome (string)
    function resolveBet(uint256 _marketId, string memory _outcome) external onlyOwner {
        if (bettingContract == address(0)) revert BettingContractNotSet();
        if (bytes(resolvedOutcomes[_marketId]).length > 0) revert BetMarketAlreadyResolved();

        resolvedOutcomes[_marketId] = _outcome;

        // Notify the betting contract with the resolved outcome using the interface
        IBetMarket(bettingContract).resolveBet(_marketId, _outcome);

        emit BetResolved(_marketId, _outcome);
    }

    /// @notice Fetches the winning outcome for a specific betting market
    /// @param _marketId ID of the market
    /// @return The winning outcome (string)
    function getWinningOutcome(uint256 _marketId) external view returns (string memory) {
        string memory outcome = resolvedOutcomes[_marketId];
        require(bytes(outcome).length > 0, "Bet market not resolved yet");
        return outcome;
    }
}