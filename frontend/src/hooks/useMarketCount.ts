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
    });

    return {
        marketCount: marketCount ? Number(marketCount) : 0,
        isLoading,
        error,
    };
};
