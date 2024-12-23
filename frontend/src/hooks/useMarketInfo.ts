// src/hooks/useMarketInfo.ts

import { BET_ABI } from "@/utils/bet-abi";
import { useReadContract } from "wagmi";

export function useMarketBets(marketId: bigint, outcome: string) {
    return useReadContract({
        address: `0x${String(
            import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
        ).substring(2)}`,
        abi: BET_ABI,
        functionName: "getMarketBets",
        args: [marketId, outcome],
        query: {
            // Optional: configure caching and refetching behavior
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 60 * 5, // every 5 minutes
        },
    });
}
