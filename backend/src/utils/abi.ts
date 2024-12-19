export const CONTRACT_ABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "message",
                type: "string",
            },
        ],
        name: "TestEvent",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "message",
                type: "string",
            },
        ],
        name: "emitEvent",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;
