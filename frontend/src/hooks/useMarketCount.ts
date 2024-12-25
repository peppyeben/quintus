import { useReadContract } from "wagmi";
import { BET_ABI } from "@/utils/bet-abi";

export const useMarketCount = () => {
    const contractAddress = `0x${String(
        import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
    ).substring(2)}` as `0x${string}`;

    const {
        data: marketCount,
        isLoading,
        error,
    } = useReadContract({
        address: contractAddress,
        abi: BET_ABI,
        functionName: "marketCount",
        query: {
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 60 * 2, // every 2 minutes
        },
    });

    return {
        marketCount: marketCount ? Number(marketCount) : 0,
        isLoading,
        error,
    };
};
