// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMetadataStorage {
    function storeMarketMetadata(
        address market,
        string memory description,
        string[] memory outcomes,
        uint256 bettingDeadline,
        uint256 resolutionDeadline
    ) external returns (bytes32 metadataHash);
   
    function getMarketMetadata(address market) external view returns (
        string memory description,
        string[] memory outcomes,
        uint256 bettingDeadline,
        uint256 resolutionDeadline
    );
}