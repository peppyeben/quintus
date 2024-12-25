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

export const mapMarketData = (
    data: readonly [
        string,
        string,
        bigint,
        bigint,
        `0x${string}`,
        boolean,
        readonly string[],
        bigint,
        string,
        number
    ],
    id: bigint
): Market => {
    return {
        id,
        title: data[0],
        description: data[1].toString(), // Convert bigint to string if needed
        betDeadline: data[2],
        resolutionDeadline: data[3],
        creator: data[4],
        resolved: data[5],
        outcomes: [...data[6]],
        totalPool: data[7],
        winningOutcome: data[8],
        category: BigInt(data[9]),
    };
};
