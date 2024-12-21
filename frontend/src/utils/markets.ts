// src/utils/markets.ts

export interface Market {
    id: bigint;
    title: string;
    description: string;
    betDeadline: bigint;
    resolutionDeadline: bigint;
    creator: string;
    resolved: boolean;
    outcomes: string[];
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
    string[], // creators
    boolean[], // resolved
    string[][], // outcomes
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
        winningOutcome: winningOutcomes[index],
        category: categories[index],
    }));
}
