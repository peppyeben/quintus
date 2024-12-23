import { useState } from "react";
import { useWriteContract, useAccount, usePublicClient } from "wagmi";
import { handleContractError } from "@/utils/errors";
import { BET_ABI } from "@/utils/bet-abi";

interface ResolveMarketOptions {
    marketId: number;
    openModal?: (options: {
        message: string;
        type: "info" | "success" | "error" | "warning";
    }) => void;
    onSuccess?: () => void;
}

interface ResolveMarketResult {
    success: boolean;
    transactionHash?: `0x${string}`;
    error?: ReturnType<typeof handleContractError>;
}

export const useResolveMarket = () => {
    const [isResolving, setIsResolving] = useState(false);
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const account = useAccount();

    const resolveMarket = async ({
        marketId,
        openModal,
        onSuccess,
    }: ResolveMarketOptions): Promise<ResolveMarketResult> => {
        // Validate wallet connection
        if (!account.isConnected) {
            openModal?.({
                message: "Please connect your wallet",
                type: "info",
            });
            return { success: false };
        }

        try {
            setIsResolving(true);

            openModal?.({
                message: "Processing market resolution...",
                type: "info",
            });

            // Execute market resolution transaction
            const txResult = await writeContractAsync({
                abi: BET_ABI,
                address: `0x${String(
                    import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
                ).substring(2)}`,
                functionName: "resolveMarket",
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
                    message:
                        "Market resolution in progress... \nYou can close this modal",
                    type: "warning",
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
            setIsResolving(false);
        }
    };

    return {
        resolveMarket,
        isResolving,
    };
};
