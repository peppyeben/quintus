import { useState, useCallback, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { BET_ABI } from "@/utils/bet-abi";

// Enum to match contract's BetStatus
export enum BetStatus {
    Pending = 0,
    Won = 1,
    Lost = 2,
}

// Bet interface matching the Solidity struct exactly
export interface Bet {
    amount: bigint; // Bet amount (in tokens)
    outcome: string; // Chosen outcome (string)
    status: BetStatus; // Status of the bet (Pending/Won/Lost)
    potentialWinnings: bigint; // Potential winnings for the bet
}

export const useUserBets = () => {
    const [userBets, setUserBets] = useState<Bet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();

    const contractAddress = `0x${String(
        import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
    ).substring(2)}` as `0x${string}`;

    const fetchUserBets = useCallback(async () => {
        if (!isConnected || !address || !publicClient) {
            setUserBets([]);
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

            const allUserBets: Bet[] = [];

            for (
                let marketId = 1;
                marketId <= Number(marketCount);
                marketId++
            ) {
                const userBetsForMarket = await fetchUserBetsForMarket(
                    BigInt(marketId)
                );
                allUserBets.push(...userBetsForMarket);
            }

            setUserBets(allUserBets);
            setIsLoading(false);
            return allUserBets;
        } catch (err) {
            console.error("Error fetching user bets:", err);
            setError(
                err instanceof Error
                    ? err
                    : new Error("Failed to fetch user bets")
            );
            setUserBets([]);
            setIsLoading(false);
            return [];
        }
    }, [isConnected, address, publicClient, contractAddress]);

    const fetchUserBetsForMarket = async (marketId: bigint) => {
        const userBetsForMarket: Bet[] = [];
        let index = 0;

        while (true) {
            try {
                const result = await publicClient?.readContract({
                    address: contractAddress,
                    abi: BET_ABI,
                    functionName: "userBets",
                    args: [marketId, address as `0x${string}`, BigInt(index)],
                });

                if (!result) break;

                const [amount, outcome, status, potentialWinnings] = result;

                // If bet amount is 0, assume no more bets
                if (amount === 0n) break;

                userBetsForMarket.push({
                    amount: amount,
                    outcome: outcome,
                    status: status,
                    potentialWinnings: potentialWinnings,
                });

                index++;
            } catch (error) {
                console.error("Error fetching user bets for market:", error);
                // If an error occurs, assume no more bets
                break;
            }
        }

        return userBetsForMarket;
    };

    // Initial fetch on hook mount
    useEffect(() => {
        fetchUserBets();
    }, [fetchUserBets]);

    const refetchUserBets = useCallback(async () => {
        return fetchUserBets();
    }, [fetchUserBets]);

    return {
        userBets,
        isLoading,
        error,
        refetchUserBets,
    };
};
