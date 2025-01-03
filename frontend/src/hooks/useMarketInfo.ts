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

export function useMarketInfo(marketId: bigint) {
    return useReadContract({
        address: `0x${String(
            import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
        ).substring(2)}`,
        abi: BET_ABI,
        functionName: "getMarketInfo",
        args: [marketId],
        query: {
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 60 * 2, // every 2 minutes
        },
    });
}

export function useMarketClaimStatus(
    marketId: bigint | undefined,
    accountAddress: `0x${string}` | undefined
) {
    return useReadContract({
        address: `0x${String(
            import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
        ).substring(2)}`,
        abi: BET_ABI,
        functionName: "hasClaimed",
        args:
            marketId !== undefined && accountAddress
                ? [marketId, accountAddress]
                : undefined,
        query: {
            enabled: !!marketId && !!accountAddress,
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 60, // every 1 minute
        },
    });
}
