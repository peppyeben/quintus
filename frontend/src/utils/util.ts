import { formatUnits } from "ethers";

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

export const formatBNBAmount = (
    amount: bigint,
    decimals: number = 5
): string => {
    const formattedAmount = parseFloat(formatUnits(amount, 18)).toFixed(
        decimals
    );
    return parseFloat(formattedAmount).toString();
};

export const calculateMultiplier = (
    betAmount: bigint,
    potentialWinnings: bigint
): string => {
    if (betAmount === 0n) return "0x";

    const multiplier =
        parseFloat(formatUnits(potentialWinnings, 18)) /
        parseFloat(formatUnits(betAmount, 18));

    return `${multiplier.toFixed(2)}x`;
};
