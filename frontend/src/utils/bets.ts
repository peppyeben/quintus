interface BetProps {
    title: string;
    description: string;
    image: string;
    deadline: number;
    totalPool: number;
    category: string;
    outcomes: string[];
}

const categories = [
    "Crypto",
    "Sports",
    "Politics",
    "Entertainment",
    "Technology",
];
const cryptoTitles = [
    "$BTC Price Prediction",
    "Ethereum's Next Move",
    "Altcoin Market Surge",
    "Crypto Regulation Impact",
    "Blockchain Breakthrough",
];
const descriptions = [
    "Will it break all-time high?",
    "Can it overcome current challenges?",
    "Predicting the next big move",
    "What's the future looking like?",
    "Market-changing event incoming",
    " Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores officiis reiciendis rerum, distinctio reprehenderit asperiores repudiandae omnis accusantium illum id optio nihil earum cum sed quasi a cumque vel architecto.",
];

export const generateRandomBets = (count: number = 3): BetProps[] => {
    return Array.from({ length: count }, () => ({
        title: cryptoTitles[Math.floor(Math.random() * cryptoTitles.length)],
        description:
            descriptions[Math.floor(Math.random() * descriptions.length)],
        image: "", // You can add logic to generate or select random images if needed
        deadline: Math.floor(Date.now() + Math.random() * 31536000000), // Random date within next year
        totalPool: Number((Math.random() * 1000).toFixed(2)),
        category: categories[Math.floor(Math.random() * categories.length)],
        outcomes: ["Yes", "No"],
    }));
};
