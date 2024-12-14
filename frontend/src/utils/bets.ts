interface BetProps {
    id: string;
    title: string;
    description: string;
    image: string;
    deadline: number;
    totalPool: number;
    category: string;
    outcomes: string[];
}

export const PREDEFINED_MARKETS: BetProps[] = [
    {
        id: "0x1234567890123456789012345678901234567890",
        title: "$BTC Price Prediction",
        description: "Will Bitcoin break $100,000 by end of year?",
        image: "", // Add image URL if available
        deadline: Date.now() + 31536000000, // One year from now
        totalPool: 500.25,
        category: "Crypto",
        outcomes: ["Yes", "No"],
    },
    {
        id: "0x2345678901234567890123456789012345678901",
        title: "Ethereum's Next Move",
        description: "Will Ethereum transition to full proof-of-stake?",
        image: "",
        deadline: Date.now() + 15768000000, // Six months from now
        totalPool: 750.5,
        category: "Crypto",
        outcomes: ["Yes", "No"],
    },
    {
        id: "0x3456789012345678901234567890123456789012",
        title: "AI Breakthrough of the Year",
        description: "Will a major AI breakthrough happen in 2024?",
        image: "",
        deadline: Date.now() + 20736000000, // Eight months from now
        totalPool: 1000.75,
        category: "Technology",
        outcomes: ["Yes", "No"],
    },
    {
        id: "0x4567890123456789012345678901234567890123",
        title: "World Cup Winner Prediction",
        description:
            "Which team will win the next major international tournament?",
        image: "",
        deadline: Date.now() + 10368000000, // Four months from now
        totalPool: 250.1,
        category: "Sports",
        outcomes: ["Team A", "Team B"],
    },
    {
        id: "0x5678901234567890123456789012345678901234",
        title: "Next US Presidential Election",
        description: "Who will win the presidential election?",
        image: "",
        deadline: Date.now() + 25920000000, // Ten months from now
        totalPool: 2000.0,
        category: "Politics",
        outcomes: ["Candidate X", "Candidate Y"],
    },
    {
        id: "0x6789012345678901234567890123456789012345",
        title: "Blockbuster Movie of the Year",
        description: "Which movie will gross the most in 2024?",
        image: "",
        deadline: Date.now() + 18144000000, // Seven months from now
        totalPool: 350.75,
        category: "Entertainment",
        outcomes: ["Movie 1", "Movie 2"],
    },
];

// Utility function to get a market by its ID
export const getMarketById = (id: string) => {
    return PREDEFINED_MARKETS.find((market) => market.id === id);
};

// Export a function to get a subset or all markets
export const getMarkets = (count?: number) => {
    return count ? PREDEFINED_MARKETS.slice(0, count) : PREDEFINED_MARKETS;
};
