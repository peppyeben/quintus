export const MARKET_CATEGORY = [
    "SPORTS",
    "CRYPTO",
    "POLITICS",
    "ELECTION",
    "OTHERS",
];

// Convert timestamp to readable date
export const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
};