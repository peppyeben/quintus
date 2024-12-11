// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title NostradaoOracle - Oracle contract for market resolution
/// @notice This contract provides the oracle functionality for resolving prediction markets
contract NostradaoOracle is Ownable {
    address public marketContract;
    
    error MarketNotSet();
    error ResolutionFailed();
    
    event OracleUpdated(address indexed newMarketContract);
    
    constructor() Ownable(msg.sender) {}
    
    /// @notice Sets the address of the market contract
    /// @param _marketContract Address of the NostradaoMarket contract
    function setMarketContract(address _marketContract) external onlyOwner {
        marketContract = _marketContract;
        emit OracleUpdated(_marketContract);
    }
    
    /// @notice Resolves a market with the specified outcome
    /// @param _marketId ID of the market to resolve
    /// @param _outcome Winning outcome
    function resolveMarket(uint256 _marketId, uint256 _outcome) external onlyOwner {
        if (marketContract == address(0)) revert MarketNotSet();
        
        (bool success,) = marketContract.call(
            abi.encodeWithSignature("resolveMarket(uint256,uint256)", _marketId, _outcome)
        );
        
        if (!success) revert ResolutionFailed();
    }
}
