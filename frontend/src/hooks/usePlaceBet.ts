// src/hooks/usePlaceBet.ts
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { BET_ABI } from "@/utils/bet-abi";
import { handleContractError, TranslatedError } from "@/utils/errors";

export const usePlaceBet = () => {
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const account = useAccount();

    const placeBet = async ({
        marketId,
        outcome,
        betAmount,
        openModal,
        onSuccess,
    }: PlaceBetArgs): Promise<PlaceBetResult> => {
        if (!account.isConnected) {
            openModal?.({
                message: "Sign in to Create Market",
                type: "info",
            });
            return { success: false };
        }

        try {
            openModal?.({
                message: "Confirming your bet placement...",
                type: "info",
            });

            const betResult = await writeContractAsync({
                abi: BET_ABI,
                address: `0x${String(
                    import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
                ).substring(2)}`,
                functionName: "placeBet",
                args: [BigInt(marketId), outcome],
                value: betAmount,
            });

            const receipt = await publicClient?.waitForTransactionReceipt({
                hash: betResult,
                confirmations: 1,
                timeout: 150_000,
            });

            if (receipt?.status === "success") {
                openModal?.({
                    message: "Your bet has been placed successfully!",
                    type: "success",
                });

                onSuccess?.();

                return {
                    success: true,
                    transactionHash: betResult,
                };
            } else {
                const error = handleContractError(
                    new Error("Transaction failed after confirmation")
                );
                openModal?.({
                    message: error.userMessage,
                    type: "error",
                });

                return {
                    success: false,
                    error,
                    transactionHash: betResult,
                };
            }
        } catch (error: unknown) {
            const translatedError = handleContractError(error);
            openModal?.({
                message: translatedError.userMessage,
                type: "error",
            });

            return {
                success: false,
                error: translatedError,
            };
        }
    };

    return { placeBet };
};

export interface PlaceBetArgs {
    marketId: number;
    outcome: string;
    betAmount: bigint;
    openModal?: (options: {
        message: string;
        type: "info" | "success" | "error";
    }) => void;
    onSuccess?: () => void;
}

export interface PlaceBetResult {
    success: boolean;
    error?: TranslatedError;
    transactionHash?: string;
}
