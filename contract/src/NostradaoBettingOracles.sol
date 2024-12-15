// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBetMarket {
    function resolveBet(uint256 _marketId, string memory _outcome) external;
}

contract NostradaoBettingOracle {
    address public bettingContract;
    mapping(uint256 => string) private resolvedOutcomes;
    mapping(address => bool) public authorizedWallets;

    // Custom errors
    error BettingContractNotSet();
    error BetMarketAlreadyResolved();
    error NotAuthorized();

    // Events
    event BettingContractUpdated(address indexed newBettingContract);
    event BetResolved(uint256 indexed marketId, string winningOutcome);
    event WalletAuthorized(address indexed wallet);
    event WalletDeauthorized(address indexed wallet);

    modifier onlyAuthorized() {
        if (!authorizedWallets[msg.sender]) revert NotAuthorized();
        _;
    }

    constructor() {
        authorizedWallets[msg.sender] = true; // Initial deployer is authorized
    }

    function addAuthorizedWallet(address wallet) external onlyAuthorized {
        authorizedWallets[wallet] = true;
        emit WalletAuthorized(wallet);
    }

    function removeAuthorizedWallet(address wallet) external onlyAuthorized {
        authorizedWallets[wallet] = false;
        emit WalletDeauthorized(wallet);
    }

    function setBettingContract(address _bettingContract) external onlyAuthorized {
        bettingContract = _bettingContract;
        emit BettingContractUpdated(_bettingContract);
    }

    function resolveBet(uint256 _marketId, string memory _outcome) external onlyAuthorized {
        if (bettingContract == address(0)) revert BettingContractNotSet();
        if (bytes(resolvedOutcomes[_marketId]).length > 0) revert BetMarketAlreadyResolved();

        resolvedOutcomes[_marketId] = _outcome;
        IBetMarket(bettingContract).resolveBet(_marketId, _outcome);
        emit BetResolved(_marketId, _outcome);
    }

    function getWinningOutcome(uint256 _marketId) external view returns (string memory) {
        string memory outcome = resolvedOutcomes[_marketId];
        require(bytes(outcome).length > 0, "Bet market not resolved yet");
        return outcome;
    }
}
