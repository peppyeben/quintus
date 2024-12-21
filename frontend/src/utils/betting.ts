// src/utils/betting.ts
import { useWriteContract, usePublicClient } from "wagmi";
// import { BetStatus, type TransactionResult } from "./types";
import { ErrorType, handleContractError, type TranslatedError } from "./errors";
import { BET_ABI } from "./bet-abi";

const { writeContractAsync } = useWriteContract();
const publicClient = usePublicClient();

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

export const placeBet = async ({
    marketId,
    outcome,
    betAmount,
    openModal,
    onSuccess,
}: PlaceBetArgs): Promise<PlaceBetResult> => {
    try {
        // Show pending transaction message if modal is available
        openModal?.({
            message: "Confirming your bet placement...",
            type: "info",
        });

        // Attempt to place the bet
        const betResult = await writeContractAsync({
            abi: BET_ABI,
            address: `0x${String(
                import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
            ).substring(2)}`,
            functionName: "placeBet",
            args: [marketId, outcome],
            value: betAmount,
        });

        // Wait for transaction confirmation
        const receipt = await publicClient?.waitForTransactionReceipt({
            hash: betResult,
            confirmations: 1,
            timeout: 150_000, // 150 second timeout
        });

        // Check transaction status
        if (receipt?.status === "success") {
            openModal?.({
                message: "Your bet has been placed successfully!",
                type: "success",
            });

            // Call success callback if provided
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

// Optional: Helper to validate bet parameters before sending transaction
export const validateBetParams = (
    // marketId: number,
    // outcome: string,
    betAmount: bigint
): TranslatedError | null => {
    if (betAmount <= 0n) {
        return {
            type: ErrorType.BETTING_AMOUNT_ZERO,
            userMessage: "Betting amount must be greater than zero",
        };
    }

    // Add any other validation logic here

    return null;
};

// Example usage in a component:
/*
const placeBetHandler = async () => {
  const result = await placeBet({
    marketId: yourMarketId,
    outcome: selectedOutcome,
    betAmount: parsedAmount,
    openModal: yourModalFunction,
    onSuccess: () => {
      // Handle success, e.g., reset form, refresh data
    }
  });

  if (!result.success) {
    console.error('Bet placement failed:', result.error);
  }
};
*/
