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

export function parseMarkets(rawMarketData: any[]): Market[] {
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

    return marketIds.map((id: number, index: number) => ({
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
