"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUINTUS_ORACLES_ABI = exports.BET_ABI = void 0;
exports.BET_ABI = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_oracle",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "CREATOR_FEE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "MARKET_CREATION_FEE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "PLATFORM_FEE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "claimWinnings",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "createMarket",
        inputs: [
            {
                name: "_betTitle",
                type: "string",
                internalType: "string",
            },
            {
                name: "_description",
                type: "string",
                internalType: "string",
            },
            {
                name: "_betDeadline",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_resolutionDeadline",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_outcomes",
                type: "string[]",
                internalType: "string[]",
            },
            {
                name: "_category",
                type: "uint8",
                internalType: "enum QuintusMarket.MarketCategory",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "getAllMarkets",
        inputs: [],
        outputs: [
            {
                name: "marketIds",
                type: "uint256[]",
                internalType: "uint256[]",
            },
            {
                name: "betTitles",
                type: "string[]",
                internalType: "string[]",
            },
            {
                name: "descriptions",
                type: "string[]",
                internalType: "string[]",
            },
            {
                name: "betDeadlines",
                type: "uint256[]",
                internalType: "uint256[]",
            },
            {
                name: "resolutionDeadlines",
                type: "uint256[]",
                internalType: "uint256[]",
            },
            {
                name: "creators",
                type: "address[]",
                internalType: "address[]",
            },
            {
                name: "resolved",
                type: "bool[]",
                internalType: "bool[]",
            },
            {
                name: "outcomes",
                type: "string[][]",
                internalType: "string[][]",
            },
            {
                name: "totalPools",
                type: "uint256[]",
                internalType: "uint256[]",
            },
            {
                name: "winningOutcomes",
                type: "string[]",
                internalType: "string[]",
            },
            {
                name: "categories",
                type: "uint8[]",
                internalType: "enum QuintusMarket.MarketCategory[]",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getMarketBets",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_outcome",
                type: "string",
                internalType: "string",
            },
        ],
        outputs: [
            {
                name: "totalBetsForOutcome",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "outcomeWeight",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getMarketInfo",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "betTitle",
                type: "string",
                internalType: "string",
            },
            {
                name: "description",
                type: "string",
                internalType: "string",
            },
            {
                name: "betDeadline",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "resolutionDeadline",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "creator",
                type: "address",
                internalType: "address",
            },
            { name: "resolved", type: "bool", internalType: "bool" },
            {
                name: "outcomes",
                type: "string[]",
                internalType: "string[]",
            },
            {
                name: "totalPool",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "winningOutcome",
                type: "string",
                internalType: "string",
            },
            {
                name: "category",
                type: "uint8",
                internalType: "enum QuintusMarket.MarketCategory",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "marketCount",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "markets",
        inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        outputs: [
            {
                name: "betTitle",
                type: "string",
                internalType: "string",
            },
            {
                name: "description",
                type: "string",
                internalType: "string",
            },
            {
                name: "betDeadline",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "resolutionDeadline",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "creator",
                type: "address",
                internalType: "address",
            },
            { name: "resolved", type: "bool", internalType: "bool" },
            {
                name: "totalPool",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "winningOutcome",
                type: "string",
                internalType: "string",
            },
            { name: "paid", type: "bool", internalType: "bool" },
            {
                name: "category",
                type: "uint8",
                internalType: "enum QuintusMarket.MarketCategory",
            },
            {
                name: "marketCreated",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "oracle",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract QuintusOracles",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "placeBet",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_outcome",
                type: "string",
                internalType: "string",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "renounceOwnership",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "resolveBet",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_outcome",
                type: "string",
                internalType: "string",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "resolveMarket",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "transferOwnership",
        inputs: [
            {
                name: "newOwner",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "userBets",
        inputs: [
            { name: "", type: "uint256", internalType: "uint256" },
            { name: "", type: "address", internalType: "address" },
            { name: "", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
            {
                name: "amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "outcome",
                type: "string",
                internalType: "string",
            },
            {
                name: "status",
                type: "uint8",
                internalType: "enum QuintusMarket.BetStatus",
            },
            {
                name: "potentialWinnings",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "event",
        name: "BetPlaced",
        inputs: [
            {
                name: "marketId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "user",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "outcome",
                type: "string",
                indexed: false,
                internalType: "string",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "MarketCreated",
        inputs: [
            {
                name: "marketId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "betTitle",
                type: "string",
                indexed: false,
                internalType: "string",
            },
            {
                name: "creator",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "category",
                type: "uint8",
                indexed: false,
                internalType: "enum QuintusMarket.MarketCategory",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "MarketReadyForResolution",
        inputs: [
            {
                name: "marketId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "betTitle",
                type: "string",
                indexed: false,
                internalType: "string",
            },
            {
                name: "outcomes",
                type: "string[]",
                indexed: false,
                internalType: "string[]",
            },
            {
                name: "totalPool",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "creator",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "category",
                type: "uint8",
                indexed: false,
                internalType: "enum QuintusMarket.MarketCategory",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "MarketResolved",
        inputs: [
            {
                name: "marketId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "winningOutcome",
                type: "string",
                indexed: false,
                internalType: "string",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnershipTransferred",
        inputs: [
            {
                name: "previousOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "newOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "WinningsClaimed",
        inputs: [
            {
                name: "marketId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "user",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    { type: "error", name: "BettingAmountCannotBeZero", inputs: [] },
    { type: "error", name: "BettingDeadlinePassed", inputs: [] },
    { type: "error", name: "InsufficientFee", inputs: [] },
    { type: "error", name: "InsufficientOutcomes", inputs: [] },
    { type: "error", name: "InvalidBetDeadline", inputs: [] },
    { type: "error", name: "InvalidOutcome", inputs: [] },
    { type: "error", name: "InvalidResolutionDeadline", inputs: [] },
    { type: "error", name: "MarketAlreadyResolved", inputs: [] },
    { type: "error", name: "MarketNotCreated", inputs: [] },
    { type: "error", name: "MarketNotResolved", inputs: [] },
    { type: "error", name: "NoBetsOnWinningOutcome", inputs: [] },
    { type: "error", name: "NoWinningsToClaim", inputs: [] },
    {
        type: "error",
        name: "OwnableInvalidOwner",
        inputs: [
            {
                name: "owner",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "OwnableUnauthorizedAccount",
        inputs: [
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ReentrancyGuardReentrantCall",
        inputs: [],
    },
    { type: "error", name: "TooEarlyToResolve", inputs: [] },
    { type: "error", name: "TransferFailed", inputs: [] },
    { type: "error", name: "UnauthorizedOracle", inputs: [] },
];
exports.QUINTUS_ORACLES_ABI = [
    {
        type: "constructor",
        inputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "addAuthorizedWallet",
        inputs: [
            {
                name: "wallet",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "authorizedWallets",
        inputs: [{ name: "", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "bettingContract",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getWinningOutcome",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "removeAuthorizedWallet",
        inputs: [
            {
                name: "wallet",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "resolveBet",
        inputs: [
            {
                name: "_marketId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_outcome",
                type: "string",
                internalType: "string",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "setBettingContract",
        inputs: [
            {
                name: "_bettingContract",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        name: "BetResolved",
        inputs: [
            {
                name: "marketId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "winningOutcome",
                type: "string",
                indexed: false,
                internalType: "string",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "BettingContractUpdated",
        inputs: [
            {
                name: "newBettingContract",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "WalletAuthorized",
        inputs: [
            {
                name: "wallet",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "WalletDeauthorized",
        inputs: [
            {
                name: "wallet",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    { type: "error", name: "BetMarketAlreadyResolved", inputs: [] },
    { type: "error", name: "BettingContractNotSet", inputs: [] },
    { type: "error", name: "NotAuthorized", inputs: [] },
    { type: "error", name: "ZeroAddress", inputs: [] },
];
