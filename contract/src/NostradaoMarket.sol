// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./NostradaoOracle.sol";

/// @title NostradaoMarket - A decentralized prediction market platform
/// @notice This contract allows users to create and participate in prediction markets
/// @dev Implements reentrancy protection and ownership mechanisms
contract NostradaoMarket is Ownable, ReentrancyGuard {
    // Market categories to organize different types of prediction markets
    enum MarketCategory {
        SPORTS,
        CRYPTO,
        POLITICS,
        ENTERTAINMENT,
        OTHERS
    }

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
    uint256 public constant MARKET_CREATION_FEE = 0.1 ether; // Fee to create market

    NostradaoOracle public oracle;                    // Oracle contract reference

    // Mappings
    mapping(uint256 => Market) public markets;        // Market ID to Market data
    mapping(uint256 => mapping(address => Bet[])) public userBets; // User bets per market

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
    /// @param _title Market title
    /// @param _description Market description
    /// @param _deadline Betting deadline timestamp
    /// @param _resolutionTime Resolution time timestamp
    /// @param _outcomes Array of possible outcomes
    /// @param _category Market category
    function createMarket(
        string memory _title,
        string memory _description, 
        uint256 _deadline,
        uint256 _resolutionTime,
        uint256[] memory _outcomes,
        MarketCategory _category
    ) external payable nonReentrant {
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_resolutionTime > _deadline, "Invalid resolution time");
        require(_outcomes.length >= 2, "Min 2 outcomes required");
        require(msg.value >= MARKET_CREATION_FEE, "Insufficient creation fee");

        uint256 marketId = marketCount++;
        Market storage market = markets[marketId];
        
        market.title = _title;
        market.description = _description;
        market.deadline = _deadline;
        market.resolutionTime = _resolutionTime;
        market.creator = msg.sender;
        market.outcomes = _outcomes;
        market.category = _category;

        emit MarketCreated(marketId, _title, msg.sender, _category);
    }

    /// @notice Places a bet on a specific market outcome
    /// @param _marketId ID of the market
    /// @param _outcome Chosen outcome to bet on
    function placeBet(uint256 _marketId, uint256 _outcome) external payable nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market already resolved");
        require(block.timestamp < market.deadline, "Market closed");
        require(msg.value > 0, "Bet amount must be > 0");

        bool validOutcome;
        for(uint256 i = 0; i < market.outcomes.length; i++) {
            if(market.outcomes[i] == _outcome) {
                validOutcome = true;
                break;
            }
        }
        require(validOutcome, "Invalid outcome");

        market.totalBets[_outcome] += msg.value;
        
        userBets[_marketId][msg.sender].push(Bet({
            amount: msg.value,
            outcome: _outcome,
            claimed: false
        }));
        
        emit BetPlaced(_marketId, msg.sender, _outcome, msg.value);
    }

    /// @notice Resolves a market with the winning outcome
    /// @param _marketId ID of the market to resolve
    /// @param _outcome Winning outcome
    function resolveMarket(uint256 _marketId, uint256 _outcome) external {
        Market storage market = markets[_marketId];
        require(block.timestamp >= market.resolutionTime, "Too early to resolve");
        require(!market.resolved, "Already resolved");
        require(msg.sender == address(oracle), "Only oracle can resolve");

        market.resolved = true;
        market.winningOutcome = _outcome;
        
        emit MarketResolved(_marketId, _outcome);
    }

    /// @notice Allows winners to claim their winnings
    /// @param _marketId ID of the market
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        
        Bet[] storage bets = userBets[_marketId][msg.sender];
        uint256 winnings = 0;
        
        for(uint256 i = 0; i < bets.length; i++) {
            if(!bets[i].claimed && bets[i].outcome == market.winningOutcome) {
                bets[i].claimed = true;
                uint256 betShare = (bets[i].amount * 1000) / market.totalBets[market.winningOutcome];
                winnings += (market.totalBets[market.winningOutcome] * betShare) / 1000;
            }
        }
        
        require(winnings > 0, "No winnings to claim");
        
        uint256 platformFeeAmount = (winnings * PLATFORM_FEE) / 1000;
        uint256 creatorFeeAmount = (winnings * CREATOR_FEE) / 1000;
        uint256 finalWinnings = winnings - platformFeeAmount - creatorFeeAmount;
        
        payable(owner()).transfer(platformFeeAmount);
        payable(market.creator).transfer(creatorFeeAmount);
        payable(msg.sender).transfer(finalWinnings);
        
        emit WinningsClaimed(_marketId, msg.sender, finalWinnings);
    }

    /// @notice Gets detailed information about a market
    /// @param _marketId ID of the market
    /// @return title The market title
    /// @return description The market description
    /// @return deadline The betting deadline timestamp
    /// @return resolutionTime The resolution time timestamp
    /// @return creator The address of the market creator
    /// @return resolved Whether the market is resolved or not
    /// @return outcomes The array of possible outcomes
    /// @return winningOutcome The ID of the winning outcome
    /// @return category The category of the market
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
    /// @param _marketId ID of the market
    /// @param _outcome Outcome to query
    /// @return Total amount bet on the outcome
    function getMarketBets(uint256 _marketId, uint256 _outcome) external view returns (uint256) {
        return markets[_marketId].totalBets[_outcome];
    }
}
