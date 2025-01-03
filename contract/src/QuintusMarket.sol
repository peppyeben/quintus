// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./QuintusOracles.sol";

/// @title QuintusMarket - A decentralized prediction market platform
/// @notice This contract allows users to create and participate in prediction markets
/// @dev Implements reentrancy protection and ownership mechanisms
contract QuintusMarket is Ownable, ReentrancyGuard {
    // Market categories to organize different types of prediction markets
    enum MarketCategory {
        SPORTS,
        CRYPTO,
        POLITICS,
        ELECTION,
        OTHERS
    }

    // Enum for Bet Status
    enum BetStatus {
        Pending,
        Won,
        Lost
    }

    /// @notice Structure defining a prediction market
    struct Market {
        string betTitle; // Bet Title (string)
        string description; // Bet Description (string)
        uint256 betDeadline; // Bet Deadline (timestamp)
        uint256 resolutionDeadline; // Resolution Deadline (timestamp)
        address creator; // Creator address
        bool resolved; // Bet resolved status
        string[] outcomes; // Possible Outcomes (string array)
        mapping(string => uint256) totalBets; // Total bets per outcome (keyed by outcome)
        uint256 totalPool; // Total amount of funds pooled in the market
        string winningOutcome; // Winning outcome (string)
        bool paid; // Payment status for winner
        MarketCategory category; // Category of the market
        bool marketCreated; // Flag to prevent modification after creation
    }

    /// @notice Structure defining a user's bet
    struct Bet {
        uint256 marketId; // Market ID
        uint256 amount; // Bet amount (in tokens)
        string outcome; // Chosen outcome (string)
        BetStatus status; // Status of the bet (Pending/Won/Lost)

    }

    // State variables
    uint256 public marketCount; // Total markets created
    uint256 public constant PLATFORM_FEE = 25; // 2.5% platform fee
    uint256 public constant CREATOR_FEE = 10; // 1% creator fee
    uint256 public constant MARKET_CREATION_FEE = 0.01 ether; // Fee to create a new market (in BNB)
    QuintusOracles public immutable oracle; // Oracle contract reference for market resolution

    // Mappings
    mapping(uint256 => Market) public markets; // Market ID to Market data
    mapping(uint256 => mapping(address => Bet[])) public userBets; // User bets per market
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // Custom errors for gas optimization
    error InvalidBetDeadline();
    error InvalidResolutionDeadline();
    error InsufficientOutcomes();
    error InsufficientFee();
    error MarketAlreadyResolved();
    error BettingDeadlinePassed();
    error BettingAmountCannotBeZero();
    error InvalidOutcome();
    error TooEarlyToResolve();
    error UnauthorizedOracle();
    error NoWinningsToClaim();
    error TransferFailed();
    error MarketNotResolved();
    error NoBetsOnWinningOutcome();
    error MarketNotCreated();
    error AlreadyPaid();
    error NoExistingBets();

    // Events
    event MarketCreated(uint256 indexed marketId, string betTitle, address creator, MarketCategory category);
    event BetPlaced(uint256 indexed marketId, address user, string outcome, uint256 amount);
    event MarketResolved(uint256 indexed marketId, string winningOutcome);
    event WinningsClaimed(uint256 indexed marketId, address user, uint256 amount);
    event MarketReadyForResolution(
    uint256 indexed marketId,
    string betTitle,
    string[] outcomes,
    uint256 totalPool,
    address creator,
    MarketCategory category
    );

    /// @notice Contract constructor
    /// @param _oracle Address of the oracle contract for fetching winning outcomes
    constructor(address _oracle) Ownable(msg.sender) {
        oracle = QuintusOracles(_oracle);
    }

    /// @notice Creates a new prediction market (bet)
    /// @param _betTitle Title of the prediction market
    /// @param _description Description of the bet
    /// @param _betDeadline Timestamp for when the betting closes
    /// @param _resolutionDeadline Timestamp for when the bet can be resolved
    /// @param _outcomes Array of possible outcomes for the bet
    /// @param _category Category of the bet (e.g., Sports, Crypto)
        function createMarket(
        string memory _betTitle,
        string memory _description,
        uint256 _betDeadline,
        uint256 _resolutionDeadline,
        string[] memory _outcomes,
        MarketCategory _category
    ) external payable nonReentrant {
        if (_betDeadline <= block.timestamp) revert InvalidBetDeadline();
        if (_resolutionDeadline <= _betDeadline) revert InvalidResolutionDeadline();
        if (_outcomes.length < 2) revert InsufficientOutcomes();
        if (msg.value < MARKET_CREATION_FEE) revert InsufficientFee();

        // Transfer market creation fee to owner
        (bool success,) = owner().call{value: MARKET_CREATION_FEE}("");
        if (!success) revert TransferFailed();

        Market storage market = markets[marketCount++];
        market.betTitle = _betTitle;
        market.description = _description;
        market.betDeadline = _betDeadline;
        market.resolutionDeadline = _resolutionDeadline;
        market.creator = msg.sender;
        market.outcomes = _outcomes;
        market.category = _category;
        market.marketCreated = true;

        emit MarketCreated(marketCount - 1, _betTitle, msg.sender, _category);
    }


    /// @notice Allows a user to place a bet on a specific outcome of a market
    /// @param _marketId The ID of the market to place a bet on
    /// @param _outcome The outcome the user is betting on
    function placeBet(uint256 _marketId, string memory _outcome) external payable nonReentrant {
    Market storage market = markets[_marketId];
    if (_marketId >= marketCount) revert MarketNotCreated();
    if (market.resolved) revert MarketAlreadyResolved();
    if (block.timestamp >= market.betDeadline) revert BettingDeadlinePassed();
    if (msg.value == 0) revert BettingAmountCannotBeZero();

    bool validOutcome = false;
    uint256 len = market.outcomes.length;
    for (uint256 i; i < len;) {
        if (keccak256(abi.encodePacked(market.outcomes[i])) == keccak256(abi.encodePacked(_outcome))) {
            validOutcome = true;
            break;
        }
        unchecked {
            ++i;
        }
    }
    if (!validOutcome) revert InvalidOutcome();

    // Update total market pool
    market.totalPool += msg.value;
    market.totalBets[_outcome] += msg.value;

    // Record the user's bet
    userBets[_marketId][msg.sender].push(
        Bet({
            marketId: _marketId,
            amount: msg.value,
            outcome: _outcome,
            status: BetStatus.Pending
        })
    );

    emit BetPlaced(_marketId, msg.sender, _outcome, msg.value);
    }

    /// @notice Allows winners to claim their winnings from the resolved market
    /// @param _marketId The ID of the resolved market
    function claimWinnings(uint256 _marketId) external nonReentrant {
    Market storage market = markets[_marketId];
    if (!market.resolved) revert MarketNotResolved();
    if (hasClaimed[_marketId][msg.sender]) revert AlreadyPaid();
    
    uint256 totalWinningBets = market.totalBets[market.winningOutcome];
    if (totalWinningBets == 0) revert NoBetsOnWinningOutcome();

    uint256 totalPool = market.totalPool;
    uint256 userWinnings = 0;
    Bet[] storage bets = userBets[_marketId][msg.sender];
    uint256 len = bets.length;

    // Calculate the user's total winnings and mark bet statuses
    for (uint256 i; i < len;) {
        if (bets[i].status == BetStatus.Pending) {
            if (keccak256(abi.encodePacked(bets[i].outcome)) == keccak256(abi.encodePacked(market.winningOutcome))) {
                bets[i].status = BetStatus.Won;
                userWinnings += (bets[i].amount * totalPool) / totalWinningBets;
            } else {
                bets[i].status = BetStatus.Lost;
            }
        }
        unchecked {
            ++i;
        }
    }

    if (userWinnings == 0) revert NoWinningsToClaim();

        // Deduct platform and creator fees
        uint256 platformFee = (userWinnings * PLATFORM_FEE) / 1000; // 2.5% fee
        uint256 creatorFee = (userWinnings * CREATOR_FEE) / 1000; // 1% fee
        uint256 finalWinnings = userWinnings - platformFee - creatorFee;

        // Mark user as claimed before transfers to prevent reentrancy
        hasClaimed[_marketId][msg.sender] = true;

        // Transfer fees and winnings
        (bool platformSuccess,) = owner().call{value: platformFee}("");
        (bool creatorSuccess,) = market.creator.call{value: creatorFee}("");
        (bool userSuccess,) = msg.sender.call{value: finalWinnings}("");

        if (!platformSuccess || !creatorSuccess || !userSuccess) revert TransferFailed();

        emit WinningsClaimed(_marketId, msg.sender, finalWinnings);
    }

    /// @notice Calculates potential winnings for a specific bet
    /// @param _bet The bet structure containing bet details
    /// @return winnings The potential winnings for the bet
    function calculateBetWinnings(
        Bet memory _bet
    ) public view returns (uint256 winnings) {
        Market storage market = markets[_bet.marketId];
        if (!market.marketCreated) revert MarketNotCreated();
        
        // Only calculate for pending bets
        if (_bet.status != BetStatus.Pending) {
            return 0;
        }
        
        uint256 totalBetsForOutcome = market.totalBets[_bet.outcome];
        if (totalBetsForOutcome > 0) {
            // Calculate raw winnings based on bet amount and total pool
            uint256 rawWinnings = (_bet.amount * market.totalPool) / totalBetsForOutcome;
            
            // Apply platform and creator fees
            uint256 platformFee = (rawWinnings * PLATFORM_FEE) / 1000;
            uint256 creatorFee = (rawWinnings * CREATOR_FEE) / 1000;
            
            // Calculate final winnings after fees
            winnings = rawWinnings - platformFee - creatorFee;
        }
        
        return winnings;
    }


    /// @notice Resolves a bet with the winning outcome from the oracle
    /// @param _marketId The ID of the market to resolve
    /// @param _outcome The winning outcome
    function resolveBet(uint256 _marketId, string memory _outcome) external {
        if (msg.sender != address(oracle)) revert UnauthorizedOracle();
        Market storage market = markets[_marketId];
        market.winningOutcome = _outcome;
        market.resolved = true;
        emit MarketResolved(_marketId, _outcome);
    }

    /// @notice Emits market details for resolution
    /// @param _marketId The ID of the market to resolve
    function resolveMarket(uint256 _marketId) external nonReentrant {
        // Get market data
        Market storage market = markets[_marketId];
        
        // Basic checks
        if (!market.marketCreated) revert MarketNotCreated();
        if (block.timestamp < market.resolutionDeadline) revert TooEarlyToResolve();
        if (market.resolved) revert MarketAlreadyResolved();

        // Emit market details for the backend to process
        emit MarketReadyForResolution(
            _marketId,
            market.betTitle,
            market.outcomes,
            market.totalPool,
            market.creator,
            market.category
        );
    }
      /// @notice Fetches all created markets
    /// @dev Returns arrays of market IDs and their corresponding details
    function getAllMarkets()
        external
        view
        returns (
            uint256[] memory marketIds,
            string[] memory betTitles,
            string[] memory descriptions,
            uint256[] memory betDeadlines,
            uint256[] memory resolutionDeadlines,
            address[] memory creators,
            bool[] memory resolved,
            string[][] memory outcomes,
            uint256[] memory totalPools,
            string[] memory winningOutcomes,
            MarketCategory[] memory categories
        )
    {
        uint256 total = marketCount;
        if (total == 0) {
            return (
                new uint256[](0),
                new string[](0),
                new string[](0),
                new uint256[](0),
                new uint256[](0),
                new address[](0),
                new bool[](0),
                new string[][](0),
                new uint256[](0),
                new string[](0),
                new MarketCategory[](0)
            );
        }

        marketIds = new uint256[](total);
        betTitles = new string[](total);
        descriptions = new string[](total);
        betDeadlines = new uint256[](total);
        resolutionDeadlines = new uint256[](total);
        creators = new address[](total);
        resolved = new bool[](total);
        outcomes = new string[][](total);
        totalPools = new uint256[](total);
        winningOutcomes = new string[](total);
        categories = new MarketCategory[](total);

        unchecked {
            for (uint256 i; i < total; ++i) {
                Market storage market = markets[i];
                marketIds[i] = i;
                betTitles[i] = market.betTitle;
                descriptions[i] = market.description;
                betDeadlines[i] = market.betDeadline;
                resolutionDeadlines[i] = market.resolutionDeadline;
                creators[i] = market.creator;
                resolved[i] = market.resolved;
                totalPools[i] = market.totalPool;
                outcomes[i] = market.outcomes;
                winningOutcomes[i] = market.winningOutcome;
                categories[i] = market.category;
            }
        }
    }

    /// @notice Fetches details about a specific market
    function getMarketInfo(uint256 _marketId)
        external
        view
        returns (
            string memory betTitle,
            string memory description,
            uint256 betDeadline,
            uint256 resolutionDeadline,
            address creator,
            bool resolved,
            string[] memory outcomes,
            uint256 totalPool,
            string memory winningOutcome,
            MarketCategory category
            
        )
    {
        Market storage market = markets[_marketId];
        if (!market.marketCreated) revert MarketNotCreated();
        return (
            market.betTitle,
            market.description,
            market.betDeadline,
            market.resolutionDeadline,
            market.creator,
            market.resolved,
            market.outcomes,
            market.totalPool,
            market.winningOutcome,
            market.category
    
        );
    }

    /// @notice Gets total bets placed on a specific outcome for a market
    /// @param _marketId The ID of the market
    /// @param _outcome The outcome for which to fetch bets
    /// @return totalBetsForOutcome Total bets placed for the specified outcome
    /// @return outcomeWeight The weight of the bets for this outcome as a percentage of the total pool
    function getMarketBets(uint256 _marketId, string memory _outcome) 
        external 
        view 
        returns (uint256 totalBetsForOutcome, uint256 outcomeWeight) 
    {
        // Access the market storage
        Market storage market = markets[_marketId];

        // Fetch total bets for the specified outcome
        totalBetsForOutcome = market.totalBets[_outcome];

        if (totalBetsForOutcome == 0) revert NoExistingBets();

        // Calculate outcome weight as a percentage of the total pool
        if (market.totalPool > 0) {
            outcomeWeight = (totalBetsForOutcome * 100) / market.totalPool;
        } else {
            outcomeWeight = 0; // Default to 0 if there is no pool
        }

        return (totalBetsForOutcome, outcomeWeight);
    }

        
}