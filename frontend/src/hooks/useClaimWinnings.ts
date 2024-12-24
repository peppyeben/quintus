import { useState } from "react";
import { useWriteContract, useAccount, usePublicClient } from "wagmi";
import { handleContractError } from "@/utils/errors";
import { BET_ABI } from "@/utils/bet-abi";

interface ClaimWinningsOptions {
    marketId: number;
    openModal?: (options: {
        message: string;
        type: "info" | "success" | "error";
    }) => void;
    onSuccess?: () => void;
}

interface ClaimWinningsResult {
    success: boolean;
    transactionHash?: `0x${string}`;
    error?: ReturnType<typeof handleContractError>;
}

export const useClaimWinnings = () => {
    const [isClaiming, setIsClaiming] = useState(false);
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const account = useAccount();

    const claimWinnings = async ({
        marketId,
        openModal,
        onSuccess,
    }: ClaimWinningsOptions): Promise<ClaimWinningsResult> => {
        // Validate wallet connection
        if (!account.isConnected) {
            openModal?.({
                message: "Sign in to Claim Winnings",
                type: "info",
            });
            return { success: false };
        }

        try {
            setIsClaiming(true);

            openModal?.({
                message: "Processing winnings claim...",
                type: "info",
            });

            // Execute winnings claim transaction
            const txResult = await writeContractAsync({
                abi: BET_ABI,
                address: `0x${String(
                    import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
                ).substring(2)}`,
                functionName: "claimWinnings",
                args: [BigInt(marketId)],
            });

            // Wait for transaction receipt
            const receipt = await publicClient?.waitForTransactionReceipt({
                hash: txResult,
                confirmations: 1,
                timeout: 150_000,
            });

            if (receipt?.status === "success") {
                openModal?.({
                    message: "Winnings claimed successfully",
                    type: "success",
                });

                onSuccess?.();

                return {
                    success: true,
                    transactionHash: txResult,
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
                    transactionHash: txResult,
                };
            }
        } catch (error: unknown) {
            // Handle and display error
            const translatedError = handleContractError(error);

            openModal?.({
                message: translatedError.userMessage,
                type: "error",
            });

            return {
                success: false,
                error: translatedError,
            };
        } finally {
            setIsClaiming(false);
        }
    };

    return {
        claimWinnings,
        isClaiming,
    };
};
