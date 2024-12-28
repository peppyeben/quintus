import { useState, useCallback, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { BET_ABI } from "@/utils/bet-abi";
import { BetStatus } from "./useUserBets";

export interface PotentialWinning {
    marketId: bigint;
    outcome: string;
    amount: bigint;
    potentialWinnings: bigint;
    status: BetStatus;
}

export const usePotentialWinnings = () => {
    const [potentialWinnings, setPotentialWinnings] = useState<
        PotentialWinning[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();

    const contractAddress = `0x${String(
        import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
    ).substring(2)}` as `0x${string}`;

    const fetchPotentialWinnings = useCallback(async () => {
        if (!isConnected || !address || !publicClient) {
            setPotentialWinnings([]);
            setIsLoading(false);
            return [];
        }

        setIsLoading(true);
        setError(null);

        try {
            const marketCount = await publicClient.readContract({
                address: contractAddress,
                abi: BET_ABI,
                functionName: "marketCount",
            });

            const allPotentialWinnings: PotentialWinning[] = [];

            for (let marketId = 0; marketId < Number(marketCount); marketId++) {
                const potentialWinningsForMarket =
                    await fetchPotentialWinningsForMarket(BigInt(marketId));
                allPotentialWinnings.push(...potentialWinningsForMarket);
            }

            setPotentialWinnings(allPotentialWinnings);
            setIsLoading(false);
            return allPotentialWinnings;
        } catch (err) {
            console.error("Error calculating potential winnings:", err);
            setError(
                err instanceof Error
                    ? err
                    : new Error("Failed to calculate potential winnings")
            );
            setPotentialWinnings([]);
            setIsLoading(false);
            return [];
        }
    }, [isConnected, address, publicClient, contractAddress]);

    const fetchPotentialWinningsForMarket = async (marketId: bigint) => {
        const potentialWinningsForMarket: PotentialWinning[] = [];
        let index = 0;

        while (true) {
            try {
                // Fetch user bet
                const userBetResult = await publicClient?.readContract({
                    address: contractAddress,
                    abi: BET_ABI,
                    functionName: "userBets",
                    args: [marketId, address as `0x${string}`, BigInt(index)],
                    account: address,
                });

                if (!userBetResult) break;

                const [bet_market_id, amount, outcome, status] = userBetResult;

                // If bet amount is 0, assume no more bets
                if (amount === 0n) break;

                // Only process pending bets
                // if (status !== BetStatus.Pending) {
                //     index++;
                //     continue;
                // }

                // Fetch market info to get total pool
                const marketInfoResult = await publicClient?.readContract({
                    address: contractAddress,
                    abi: BET_ABI,
                    functionName: "getMarketInfo",
                    args: [marketId],
                });

                if (!marketInfoResult) {
                    index++;
                    continue;
                }

                const totalPool = marketInfoResult[7];

                // Fetch total bets for this outcome
                const marketBetsResult = await publicClient?.readContract({
                    address: contractAddress,
                    abi: BET_ABI,
                    functionName: "getMarketBets",
                    args: [marketId, outcome],
                });

                if (!marketBetsResult) {
                    index++;
                    continue;
                }

                const totalBetsForOutcome = marketBetsResult[0];

                // Calculate potential winnings
                const potentialWinnings =
                    totalBetsForOutcome > 0
                        ? (amount * totalPool) / totalBetsForOutcome
                        : 0n;

                potentialWinningsForMarket.push({
                    marketId: bet_market_id,
                    outcome: outcome,
                    amount: amount,
                    potentialWinnings: potentialWinnings,
                    status: status,
                });

                index++;
            } catch (error) {
                console.error(error);
                // If an error occurs, assume no more bets
                break;
            }
        }

        return potentialWinningsForMarket;
    };

    // Initial fetch on hook mount
    useEffect(() => {
        fetchPotentialWinnings();
    }, [fetchPotentialWinnings]);

    const refetchPotentialWinnings = useCallback(async () => {
        return fetchPotentialWinnings();
    }, [fetchPotentialWinnings]);

    return {
        potentialWinnings,
        isLoading,
        error,
        refetchPotentialWinnings,
    };
};
