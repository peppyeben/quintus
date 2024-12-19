// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IBetMarket Interface
/// @notice Interface for the betting market contract that handles bet resolution
interface IBetMarket {
    /// @notice Resolves a bet with the given outcome
    /// @param _marketId The ID of the market to resolve
    /// @param _outcome The winning outcome of the bet
    function resolveBet(uint256 _marketId, string memory _outcome) external;
}

/// @title QuintusOracles
/// @notice Oracle contract that manages bet resolutions and authorized wallets
/// @dev Acts as a trusted oracle for determining betting outcomes
contract QuintusOracles {
    // State Variables
    /// @notice Address of the betting contract that this oracle reports to
    address public bettingContract;
    /// @notice Mapping of market IDs to their resolved outcomes
    mapping(uint256 => string) private resolvedOutcomes;
    /// @notice Mapping of addresses to their authorization status
    mapping(address => bool) public authorizedWallets;

    // Custom errors for better gas efficiency and clarity
    /// @notice Error thrown when betting contract address is not set
    error BettingContractNotSet();
    /// @notice Error thrown when attempting to resolve an already resolved bet
    error BetMarketAlreadyResolved();
    /// @notice Error thrown when unauthorized wallet attempts restricted action
    error NotAuthorized();
    /// @notice Error thrown when zero address is provided
    error ZeroAddress();

    // Events for logging important contract actions
    /// @notice Emitted when betting contract address is updated
    event BettingContractUpdated(address indexed newBettingContract);
    /// @notice Emitted when a bet is resolved
    event BetResolved(uint256 indexed marketId, string winningOutcome);
    /// @notice Emitted when a wallet is authorized
    event WalletAuthorized(address indexed wallet);
    /// @notice Emitted when a wallet is deauthorized
    event WalletDeauthorized(address indexed wallet);

    /// @notice Modifier to restrict access to authorized wallets only
    modifier onlyAuthorized() {
        if (!authorizedWallets[msg.sender]) revert NotAuthorized();
        _;
    }

    /// @notice Constructor sets deployer as first authorized wallet
    constructor() {
        authorizedWallets[msg.sender] = true;
    }

    /// @notice Adds a new authorized wallet
    /// @param wallet Address to authorize
    function addAuthorizedWallet(address wallet) external onlyAuthorized {
        authorizedWallets[wallet] = true;
        emit WalletAuthorized(wallet);
    }

    /// @notice Removes an authorized wallet
    /// @param wallet Address to deauthorize
    function removeAuthorizedWallet(address wallet) external onlyAuthorized {
        authorizedWallets[wallet] = false;
        emit WalletDeauthorized(wallet);
    }

    /// @notice Sets the betting contract address
    /// @param _bettingContract Address of the betting contract
    function setBettingContract(address _bettingContract) external onlyAuthorized {
        if (_bettingContract == address(0)) revert ZeroAddress();
        bettingContract = _bettingContract;
        emit BettingContractUpdated(_bettingContract);
    }

    /// @notice Resolves a bet with the given outcome
    /// @param _marketId The ID of the market to resolve
    /// @param _outcome The winning outcome of the bet
    function resolveBet(uint256 _marketId, string memory _outcome) external onlyAuthorized {
        if (bettingContract == address(0)) revert BettingContractNotSet();
        if (bytes(resolvedOutcomes[_marketId]).length > 0) revert BetMarketAlreadyResolved();

        resolvedOutcomes[_marketId] = _outcome;
        emit BetResolved(_marketId, _outcome);
        IBetMarket(bettingContract).resolveBet(_marketId, _outcome);
    }

    /// @notice Gets the winning outcome for a resolved bet
    /// @param _marketId The ID of the market to query
    /// @return The winning outcome string
    function getWinningOutcome(uint256 _marketId) external view returns (string memory) {
        string memory outcome = resolvedOutcomes[_marketId];
        require(bytes(outcome).length > 0, "Bet market not resolved yet");
        return outcome;
    }
}
