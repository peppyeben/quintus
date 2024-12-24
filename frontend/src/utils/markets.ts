// src/utils/markets.ts

export interface Market {
    id: bigint;
    title: string;
    description: string;
    betDeadline: bigint;
    resolutionDeadline: bigint;
    creator: `0x${string}`;
    resolved: boolean;
    outcomes: string[];
    totalPool: bigint;
    winningOutcome: string;
    category: bigint;
}

// Type for the raw data array from the contract
export type RawMarketData = [
    bigint[], // marketIds
    string[], // betTitles
    string[], // descriptions
    bigint[], // betDeadlines
    bigint[], // resolutionDeadlines
    `0x${string}`[], // creators
    boolean[], // resolved
    string[][], // outcomes
    bigint[], // totalPool
    string[], // winningOutcomes
    bigint[] // categories
];

export function parseMarkets(rawMarketData: RawMarketData): Market[] {
    const [
        marketIds,
        betTitles,
        descriptions,
        betDeadlines,
        resolutionDeadlines,
        creators,
        resolved,
        outcomes,
        totalPools,
        winningOutcomes,
        categories,
    ] = rawMarketData;

    return marketIds.map((id, index) => ({
        id,
        title: betTitles[index],
        description: descriptions[index],
        betDeadline: betDeadlines[index],
        resolutionDeadline: resolutionDeadlines[index],
        creator: creators[index],
        resolved: resolved[index],
        outcomes: outcomes[index],
        totalPool: totalPools[index],
        winningOutcome: winningOutcomes[index],
        category: categories[index],
    }));
}
