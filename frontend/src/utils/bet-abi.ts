export const BET_ABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_oracle",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        type: "error",
        name: "BettingAmountCannotBeZero",
    },
    {
        inputs: [],
        type: "error",
        name: "BettingDeadlinePassed",
    },
    { inputs: [], type: "error", name: "InsufficientFee" },
    {
        inputs: [],
        type: "error",
        name: "InsufficientOutcomes",
    },
    { inputs: [], type: "error", name: "InvalidBetDeadline" },
    { inputs: [], type: "error", name: "InvalidOutcome" },
    {
        inputs: [],
        type: "error",
        name: "InvalidResolutionDeadline",
    },
    {
        inputs: [],
        type: "error",
        name: "MarketAlreadyResolved",
    },
    { inputs: [], type: "error", name: "MarketNotCreated" },
    { inputs: [], type: "error", name: "MarketNotResolved" },
    {
        inputs: [],
        type: "error",
        name: "NoBetsOnWinningOutcome",
    },
    { inputs: [], type: "error", name: "NoWinningsToClaim" },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        type: "error",
        name: "OwnableInvalidOwner",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        type: "error",
        name: "OwnableUnauthorizedAccount",
    },
    {
        inputs: [],
        type: "error",
        name: "ReentrancyGuardReentrantCall",
    },
    { inputs: [], type: "error", name: "TooEarlyToResolve" },
    { inputs: [], type: "error", name: "TransferFailed" },
    { inputs: [], type: "error", name: "UnauthorizedOracle" },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
                indexed: true,
            },
            {
                internalType: "address",
                name: "user",
                type: "address",
                indexed: false,
            },
            {
                internalType: "string",
                name: "outcome",
                type: "string",
                indexed: false,
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
                indexed: false,
            },
        ],
        type: "event",
        name: "BetPlaced",
        anonymous: false,
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
                indexed: true,
            },
            {
                internalType: "string",
                name: "betTitle",
                type: "string",
                indexed: false,
            },
            {
                internalType: "address",
                name: "creator",
                type: "address",
                indexed: false,
            },
            {
                internalType: "enum QuintusMarket.MarketCategory",
                name: "category",
                type: "uint8",
                indexed: false,
            },
        ],
        type: "event",
        name: "MarketCreated",
        anonymous: false,
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
                indexed: true,
            },
            {
                internalType: "string",
                name: "winningOutcome",
                type: "string",
                indexed: false,
            },
        ],
        type: "event",
        name: "MarketResolved",
        anonymous: false,
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "previousOwner",
                type: "address",
                indexed: true,
            },
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
                indexed: true,
            },
        ],
        type: "event",
        name: "OwnershipTransferred",
        anonymous: false,
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
                indexed: true,
            },
            {
                internalType: "address",
                name: "user",
                type: "address",
                indexed: false,
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
                indexed: false,
            },
        ],
        type: "event",
        name: "WinningsClaimed",
        anonymous: false,
    },
    {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "CREATOR_FEE",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
    },
    {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "MARKET_CREATION_FEE",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
    },
    {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "PLATFORM_FEE",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_marketId",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
        name: "claimWinnings",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_betTitle",
                type: "string",
            },
            {
                internalType: "string",
                name: "_description",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "_betDeadline",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_resolutionDeadline",
                type: "uint256",
            },
            {
                internalType: "string[]",
                name: "_outcomes",
                type: "string[]",
            },
            {
                internalType: "enum QuintusMarket.MarketCategory",
                name: "_category",
                type: "uint8",
            },
        ],
        stateMutability: "payable",
        type: "function",
        name: "createMarket",
    },
    {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "getAllMarkets",
        outputs: [
            {
                internalType: "uint256[]",
                name: "marketIds",
                type: "uint256[]",
            },
            {
                internalType: "string[]",
                name: "betTitles",
                type: "string[]",
            },
            {
                internalType: "string[]",
                name: "descriptions",
                type: "string[]",
            },
            {
                internalType: "uint256[]",
                name: "betDeadlines",
                type: "uint256[]",
            },
            {
                internalType: "uint256[]",
                name: "resolutionDeadlines",
                type: "uint256[]",
            },
            {
                internalType: "address[]",
                name: "creators",
                type: "address[]",
            },
            {
                internalType: "bool[]",
                name: "resolved",
                type: "bool[]",
            },
            {
                internalType: "string[][]",
                name: "outcomes",
                type: "string[][]",
            },
            {
                internalType: "string[]",
                name: "winningOutcomes",
                type: "string[]",
            },
            {
                internalType: "enum QuintusMarket.MarketCategory[]",
                name: "categories",
                type: "uint8[]",
            },
        ],
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_marketId",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "_outcome",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
        name: "getMarketBets",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_marketId",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
        name: "getMarketInfo",
        outputs: [
            {
                internalType: "string",
                name: "betTitle",
                type: "string",
            },
            {
                internalType: "string",
                name: "description",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "betDeadline",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "resolutionDeadline",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "creator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "resolved",
                type: "bool",
            },
            {
                internalType: "string[]",
                name: "outcomes",
                type: "string[]",
            },
            {
                internalType: "string",
                name: "winningOutcome",
                type: "string",
            },
            {
                internalType: "enum QuintusMarket.MarketCategory",
                name: "category",
                type: "uint8",
            },
        ],
    },
    {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "marketCount",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
        name: "markets",
        outputs: [
            {
                internalType: "string",
                name: "betTitle",
                type: "string",
            },
            {
                internalType: "string",
                name: "description",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "betDeadline",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "resolutionDeadline",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "creator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "resolved",
                type: "bool",
            },
            {
                internalType: "uint256",
                name: "totalPool",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "winningOutcome",
                type: "string",
            },
            {
                internalType: "bool",
                name: "paid",
                type: "bool",
            },
            {
                internalType: "enum QuintusMarket.MarketCategory",
                name: "category",
                type: "uint8",
            },
            {
                internalType: "bool",
                name: "marketCreated",
                type: "bool",
            },
        ],
    },
    {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "oracle",
        outputs: [
            {
                internalType: "contract QuintusOracles",
                name: "",
                type: "address",
            },
        ],
    },
    {
        inputs: [],
        stateMutability: "view",
        type: "function",
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_marketId",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "_outcome",
                type: "string",
            },
        ],
        stateMutability: "payable",
        type: "function",
        name: "placeBet",
    },
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "function",
        name: "renounceOwnership",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_marketId",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "_outcome",
                type: "string",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
        name: "resolveBet",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_marketId",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
        name: "resolveMarket",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
        name: "transferOwnership",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
        name: "userBets",
        outputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "outcome",
                type: "string",
            },
            {
                internalType: "enum QuintusMarket.BetStatus",
                name: "status",
                type: "uint8",
            },
            {
                internalType: "uint256",
                name: "potentialWinnings",
                type: "uint256",
            },
        ],
    },
] as const;
