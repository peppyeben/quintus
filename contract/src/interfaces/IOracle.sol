// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IOracle - Interface for interacting with an Oracle contract
/// @notice Defines the methods for requesting and retrieving results from an Oracle
interface IOracle {
    /**
     * @notice Requests a result for a specific market and event.
     * @param marketId The unique identifier of the market.
     * @param eventId The identifier of the event to resolve.
     */
    function requestResult(bytes32 marketId, string calldata eventId) external;

    /**
     * @notice Retrieves the result for a specific market.
     * @param marketId The unique identifier of the market.
     * @return result The outcome of the market (e.g., 0, 1, etc.).
     * @return isResolved A boolean indicating whether the result is finalized.
     */
    function getResult(bytes32 marketId) external view returns (uint8 result, bool isResolved);
}