// src/hooks/useMarkets.ts
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { BET_ABI } from "@/utils/bet-abi";
import { Market, parseMarkets, RawMarketData } from "@/utils/markets";

export const useMarkets = () => {
    const [allMarkets, setAllMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const {
        data: allMarketsData,
        refetch,
        isPending,
        isError,
        error: contractError,
    } = useReadContract({
        abi: BET_ABI,
        address: `0x${String(
            import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
        ).substring(2)}`,
        functionName: "getAllMarkets",
    });

    useEffect(() => {
        if (allMarketsData) {
            try {
                const parsedMarkets = parseMarkets(allMarketsData as RawMarketData);
                setAllMarkets(parsedMarkets);
                setIsLoading(false);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to parse markets")
                );
                setIsLoading(false);
            }
        }
    }, [allMarketsData]);

    useEffect(() => {
        if (isError) {
            setError(contractError);
            setIsLoading(false);
        }
    }, [isError, contractError]);

    return {
        markets: allMarkets,
        isLoading,
        isPending,
        error,
        refetchMarkets: refetch,
    };
};
