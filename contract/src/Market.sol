// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Market - Prediction market contract
/// @notice Handles individual prediction markets
contract Market {
    // === State Variables ===
    address public creator;
    string public title;
    string public description;
    string[] public outcomes;
    uint256 public bettingDeadline;
    uint256 public resolutionDeadline;
    address public oracle;
    address public feeCollector;

    // Market status
    enum MarketStatus { Active, Resolved, Cancelled }

    // Fixed odds or dynamic odds
    enum OddsType { Fixed, Dynamic } 

    // Bet information
    struct BetInfo {
        uint256 amount;
        uint8 outcome;
        uint256 odds;
        bool claimed;
    } 

    // === Market State ===

    MarketStatus public status;

    // Odds type

    OddsType public oddsType;

    // Pools and bets

    mapping(uint8 => uint256) public outcomePoolSizes; // Pools for each outcome

    mapping(address => BetInfo[]) public userBets; // Bets for each user
    uint256 public totalBets; // Total number of bets
    uint256 public platformFee; // In basis points (e.g., 100 = 1%)

    bool public resolved; // Whether the market has been resolved
    uint8 public winningOutcome; // Index of winning outcome

    // === Events ===
    event BetPlaced(address indexed bettor, uint256 amount, uint8 outcome);
    event MarketResolved(uint8 winningOutcome);

    // === Constructor ===
    struct MarketParameters {
        address creator;
        string description;
        string[] outcomes;
        uint256 bettingDeadline;
        uint256 resolutionDeadline;
        address oracle;
        address feeCollector;
    }

    constructor(MarketParameters memory params) {
        require(params.creator != address(0), "Creator cannot be zero address");
        require(params.oracle != address(0), "Oracle cannot be zero address");
        require(params.feeCollector != address(0), "Fee collector cannot be zero address");
        require(params.outcomes.length > 1, "At least two outcomes required");
        require(params.bettingDeadline > block.timestamp, "Betting deadline must be in the future");
        require(params.resolutionDeadline > params.bettingDeadline, "Resolution deadline must be after betting deadline");

        creator = params.creator;
        description = params.description;
        outcomes = params.outcomes;
        bettingDeadline = params.bettingDeadline;
        resolutionDeadline = params.resolutionDeadline;
        oracle = params.oracle;
        feeCollector = params.feeCollector;

        status = MarketStatus.Active;
        oddsType = OddsType.Dynamic;
        platformFee = 100; // 1% platform fee
    }

    // === External Functions ===
    function calculateOdds(uint8 outcome) public view returns (uint256) {
        require(outcome < outcomes.length, "Invalid outcome");
       
        if (oddsType == OddsType.Dynamic) {
            if (outcomePoolSizes[outcome] == 0) return 0;
            return (totalBets * 1e18) / outcomePoolSizes[outcome];
        }
        //fixed odds logic here

        return 0;
    }

    function placeBet(uint8 outcome) external payable {
        require(status == MarketStatus.Active, "Market not active");
        require(block.timestamp < bettingDeadline, "Betting closed");
        require(outcome < outcomes.length, "Invalid outcome");
       
        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 betAmount = msg.value - fee;
       
        // Update pools
        outcomePoolSizes[outcome] += betAmount;
        totalBets += betAmount;
       
        // Record bet
        userBets[msg.sender].push(BetInfo({
            amount: betAmount,
            outcome: outcome,
            odds: calculateOdds(outcome),
            claimed: false
        }));
       
        // Transfer fee
        if (fee > 0) {
            payable(feeCollector).transfer(fee);
        }
       
        emit BetPlaced(msg.sender, betAmount, outcome);
    }

    /// @notice Resolves the market by setting the winning outcome
    /// @param _winningOutcome The index of the winning outcome
    function resolveMarket(uint8 _winningOutcome) external {
        require(msg.sender == oracle, "Only oracle can resolve the market");
        require(block.timestamp > resolutionDeadline, "Resolution deadline not reached");
        require(!resolved, "Market already resolved");
        require(_winningOutcome < outcomes.length, "Invalid winning outcome");

        resolved = true;
        winningOutcome = _winningOutcome;
        status = MarketStatus.Resolved;

        emit MarketResolved(_winningOutcome);

    }

    // === Internal Functions ===

    function calculatePayout(BetInfo memory bet) internal view returns (uint256) {
        if (bet.outcome != winningOutcome) return 0;
        
        // Calculate total pool size excluding fees
        uint256 totalPool = totalBets;
        
        // Calculate winner's share of the pool
        uint256 winningPool = outcomePoolSizes[winningOutcome];
        if (winningPool == 0) return 0;
        
        // Calculate payout proportional to bet amount
        return (bet.amount * totalPool) / winningPool;
    }

    function claimWinnings() external {
        require(status == MarketStatus.Resolved, "Market not resolved");
       
        uint256 totalPayout = 0;
        BetInfo[] storage bets = userBets[msg.sender];
       
        for (uint256 i = 0; i < bets.length; i++) {
            if (!bets[i].claimed) {
                uint256 payout = calculatePayout(bets[i]);
                if (payout > 0) {
                    bets[i].claimed = true;
                    totalPayout += payout;
                }
            }
        }
       
        require(totalPayout > 0, "No winnings to claim");
        payable(msg.sender).transfer(totalPayout);
    }

    // function to cancel market if needed
    function cancelMarket() external {
        require(msg.sender == creator, "Only creator can cancel");
        require(block.timestamp < bettingDeadline, "Cannot cancel after betting deadline");
        
        status = MarketStatus.Cancelled;
    }

    // Refund function for cancelled markets
    function refundBets() external {
        require(status == MarketStatus.Cancelled, "Market not cancelled");
        
        BetInfo[] storage bets = userBets[msg.sender];
        uint256 totalRefund = 0;
        
        for (uint256 i = 0; i < bets.length; i++) {
            if (!bets[i].claimed) {
                totalRefund += bets[i].amount;
                bets[i].claimed = true;
            }
        }
        
        require(totalRefund > 0, "No refunds available");
        payable(msg.sender).transfer(totalRefund);
    }
}