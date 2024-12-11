// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./NostradaoOracle.sol";

/// @title NostradaoMarket - A decentralized prediction market platform
/// @notice This contract allows users to create and participate in prediction markets
/// @dev Implements reentrancy protection and ownership mechanisms
contract NostradaoMarket is Ownable, ReentrancyGuard {
    // Market categories to organize different types of prediction markets
    enum MarketCategory { SPORTS, CRYPTO, POLITICS, ELECTION, OTHERS }

    /// @notice Structure defining a prediction market
    struct Market {
        string title;                                  // Market title
        string description;                            // Detailed description
        uint256 deadline;                             // Betting deadline
        uint256 resolutionTime;                       // When the market can be resolved
        address creator;                              // Market creator address
        bool resolved;                                // Resolution status
        uint256[] outcomes;                           // Possible outcomes
        mapping(uint256 => uint256) totalBets;        // Total bets per outcome
        uint256 winningOutcome;                       // Winning outcome ID
        bool paid;                                    // Payment status
        MarketCategory category;                      // Market category
    }

    /// @notice Structure defining a user's bet
    struct Bet {
        uint256 amount;                               // Bet amount
        uint256 outcome;                              // Chosen outcome
        bool claimed;                                 // Claim status
    }

    // State variables
    uint256 public marketCount;                       // Total markets created
    uint256 public constant PLATFORM_FEE = 25;        // 2.5% platform fee
    uint256 public constant CREATOR_FEE = 10;         // 1% creator fee
    uint256 public constant MARKET_CREATION_FEE = 0.01 ether; // Fee to create market
    NostradaoOracle public immutable oracle;          // Oracle contract reference

    // Mappings
    mapping(uint256 => Market) public markets;        // Market ID to Market data
    mapping(uint256 => mapping(address => Bet[])) public userBets; // User bets per market

    // Custom errors for gas optimization
    error InvalidDeadline();
    error InvalidResolutionTime();
    error InsufficientOutcomes();
    error InsufficientFee();
    error MarketAlreadyResolved();
    error MarketClosed();
    error InvalidBetAmount();
    error InvalidOutcome();
    error TooEarlyToResolve();
    error UnauthorizedOracle();
    error NoWinningsToClaim();
    error TransferFailed();
    error MarketNotResolved();
    error NoBetsOnWinningOutcome();

    // Events
    event MarketCreated(uint256 indexed marketId, string title, address creator, MarketCategory category);
    event BetPlaced(uint256 indexed marketId, address user, uint256 outcome, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint256 winningOutcome);
    event WinningsClaimed(uint256 indexed marketId, address user, uint256 amount);

    /// @notice Contract constructor
    /// @param _oracle Address of the oracle contract
    constructor(address _oracle) Ownable(msg.sender) {
        oracle = NostradaoOracle(_oracle);
    }

    /// @notice Creates a new prediction market
    function createMarket(
        string calldata _title,
        string calldata _description,
        uint256 _deadline,
        uint256 _resolutionTime,
        uint256[] calldata _outcomes,
        MarketCategory _category
    ) external payable nonReentrant {
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        if (_resolutionTime <= _deadline) revert InvalidResolutionTime();
        if (_outcomes.length < 2) revert InsufficientOutcomes();
        if (msg.value < MARKET_CREATION_FEE) revert InsufficientFee();

        Market storage market = markets[marketCount++];
        market.title = _title;
        market.description = _description;
        market.deadline = _deadline;
        market.resolutionTime = _resolutionTime;
        market.creator = msg.sender;
        market.outcomes = _outcomes;
        market.category = _category;

        emit MarketCreated(marketCount - 1, _title, msg.sender, _category);
    }

    /// @notice Places a bet on a specific market outcome
    function placeBet(uint256 _marketId, uint256 _outcome) external payable nonReentrant {
        Market storage market = markets[_marketId];
        if (market.resolved) revert MarketAlreadyResolved();
        if (block.timestamp >= market.deadline) revert MarketClosed();
        if (msg.value == 0) revert InvalidBetAmount();

        bool validOutcome;
        uint256 len = market.outcomes.length;
        for(uint256 i; i < len;) {
            if(market.outcomes[i] == _outcome) {
                validOutcome = true;
                break;
            }
            unchecked { ++i; }
        }
        if (!validOutcome) revert InvalidOutcome();

        market.totalBets[_outcome] += msg.value;
        userBets[_marketId][msg.sender].push(Bet({
            amount: msg.value,
            outcome: _outcome,
            claimed: false
        }));

        emit BetPlaced(_marketId, msg.sender, _outcome, msg.value);
    }

    /// @notice Resolves a market with the winning outcome
    function resolveMarket(uint256 _marketId, uint256 _outcome) external {
        if (msg.sender != address(oracle)) revert UnauthorizedOracle();
        Market storage market = markets[_marketId];
        if (block.timestamp < market.resolutionTime) revert TooEarlyToResolve();
        if (market.resolved) revert MarketAlreadyResolved();

        market.resolved = true;
        market.winningOutcome = _outcome;
        
        emit MarketResolved(_marketId, _outcome);
    }

    /// @notice Allows winners to claim their winnings
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        if (!market.resolved) revert MarketNotResolved();

        uint256 totalWinningBets = market.totalBets[market.winningOutcome];
        if (totalWinningBets == 0) revert NoBetsOnWinningOutcome();

        uint256 winnings;
        Bet[] storage bets = userBets[_marketId][msg.sender];
        uint256 len = bets.length;
        
        for (uint256 i; i < len;) {
            if (!bets[i].claimed && bets[i].outcome == market.winningOutcome) {
                bets[i].claimed = true;
                winnings += (bets[i].amount * totalWinningBets) / totalWinningBets;
            }
            unchecked { ++i; }
        }

        if (winnings == 0) revert NoWinningsToClaim();

        _transferWinnings(market.creator, winnings);
        emit WinningsClaimed(_marketId, msg.sender, winnings);
    }

    /// @notice Internal function to handle winnings transfer
    function _transferWinnings(address creator, uint256 winnings) private {
        uint256 platformFee = (winnings * PLATFORM_FEE) / 1000;
        uint256 creatorFee = (winnings * CREATOR_FEE) / 1000;
        uint256 finalWinnings = winnings - platformFee - creatorFee;

        (bool success1, ) = owner().call{value: platformFee}("");
        (bool success2, ) = creator.call{value: creatorFee}("");
        (bool success3, ) = msg.sender.call{value: finalWinnings}("");

        if (!success1 || !success2 || !success3) revert TransferFailed();
    }

    /// @notice Gets detailed information about a market
    function getMarketInfo(uint256 _marketId) external view returns (
        string memory title,
        string memory description,
        uint256 deadline,
        uint256 resolutionTime,
        address creator,
        bool resolved,
        uint256[] memory outcomes,
        uint256 winningOutcome,
        MarketCategory category
    ) {
        Market storage market = markets[_marketId];
        return (
            market.title,
            market.description,
            market.deadline,
            market.resolutionTime,
            market.creator,
            market.resolved,
            market.outcomes,
            market.winningOutcome,
            market.category
        );
    }

    /// @notice Gets total bets placed on a specific outcome
    function getMarketBets(uint256 _marketId, uint256 _outcome) external view returns (uint256) {
        return markets[_marketId].totalBets[_outcome];
    }
}
