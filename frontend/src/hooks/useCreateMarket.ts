// src/hooks/useCreateMarket.ts
import { useState } from "react";
import { useWriteContract, useAccount, usePublicClient } from "wagmi";
import { parseEther } from "ethers";
import { BET_ABI } from "@/utils/bet-abi";
import { MARKET_CATEGORY } from "@/utils/util";
import { handleContractError } from "@/utils/errors";

interface CreateMarketOptions {
    marketTitle: string;
    description: string;
    betDeadline: Date;
    resolutionDeadline: Date;
    outcomes: { name: string; probability?: number }[];
    category: string;
    openModal?: (options: {
        message: string;
        type: "info" | "success" | "error";
    }) => void;
    onSuccess?: () => void;
}

interface CreateMarketResult {
    success: boolean;
    transactionHash?: `0x${string}`;
    error?: ReturnType<typeof handleContractError>;
}

export const useCreateMarket = () => {
    const [isCreating, setIsCreating] = useState(false);
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const account = useAccount();

    const createMarket = async ({
        marketTitle,
        description,
        betDeadline,
        resolutionDeadline,
        outcomes,
        category,
        openModal,
        onSuccess,
    }: CreateMarketOptions): Promise<CreateMarketResult> => {
        // Validate wallet connection
        if (!account.isConnected) {
            openModal?.({
                message: "Sign in to Create Market",
                type: "info",
            });
            return { success: false };
        }

        // Prepare market category
        const mktCatLw = MARKET_CATEGORY.map((c) => String(c).toLowerCase());
        const selectedCategory = mktCatLw.indexOf(
            String(category).toLowerCase()
        );

        // Prepare market arguments
        const marketArgs = [
            marketTitle,
            description,
            Math.floor(betDeadline.getTime() / 1000),
            Math.floor(resolutionDeadline.getTime() / 1000),
            outcomes.map((c) => c.name),
            selectedCategory,
        ];

        // Market creation fee
        const marketCreationFee = parseEther("0.01");

        try {
            setIsCreating(true);

            openModal?.({
                message: "Confirming market creation...",
                type: "info",
            });

            // Execute market creation transaction
            const txResult = await writeContractAsync({
                abi: BET_ABI,
                address: `0x${String(
                    import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
                ).substring(2)}`,
                functionName: "createMarket",
                args: marketArgs,
                value: marketCreationFee,
            });

            // Wait for transaction receipt
            const receipt = await publicClient?.waitForTransactionReceipt({
                hash: txResult,
                confirmations: 1,
                timeout: 150_000,
            });

            if (receipt?.status === "success") {
                openModal?.({
                    message: "Market created successfully",
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
            setIsCreating(false);
        }
    };

    return {
        createMarket,
        isCreating,
    };
};
