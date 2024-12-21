// src/utils/errors.ts
export enum ErrorType {
    // Transaction Status Errors
    TRANSACTION_TIMEOUT = "TRANSACTION_TIMEOUT",
    // Blockchain and Wallet Errors
    USER_REJECTED = "USER_REJECTED",
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
    NETWORK_ERROR = "NETWORK_ERROR",
    HTTP_REQUEST_FAILED = "HTTP_REQUEST_FAILED",

    // Betting Specific Errors
    BET_VALIDATION_FAILED = "BET_VALIDATION_FAILED",
    BET_PROCESSING_ERROR = "BET_PROCESSING_ERROR",
    INVALID_BET_AMOUNT = "INVALID_BET_AMOUNT",

    // Smart Contract Specific Errors
    INVALID_BET_DEADLINE = "INVALID_BET_DEADLINE",
    INVALID_RESOLUTION_DEADLINE = "INVALID_RESOLUTION_DEADLINE",
    INSUFFICIENT_OUTCOMES = "INSUFFICIENT_OUTCOMES",
    INSUFFICIENT_FEE = "INSUFFICIENT_FEE",
    MARKET_ALREADY_RESOLVED = "MARKET_ALREADY_RESOLVED",
    BETTING_DEADLINE_PASSED = "BETTING_DEADLINE_PASSED",
    BETTING_AMOUNT_ZERO = "BETTING_AMOUNT_ZERO",
    INVALID_OUTCOME = "INVALID_OUTCOME",
    TOO_EARLY_TO_RESOLVE = "TOO_EARLY_TO_RESOLVE",
    UNAUTHORIZED_ORACLE = "UNAUTHORIZED_ORACLE",
    NO_WINNINGS_TO_CLAIM = "NO_WINNINGS_TO_CLAIM",
    TRANSFER_FAILED = "TRANSFER_FAILED",
    MARKET_NOT_RESOLVED = "MARKET_NOT_RESOLVED",
    NO_BETS_ON_WINNING_OUTCOME = "NO_BETS_ON_WINNING_OUTCOME",
    MARKET_NOT_CREATED = "MARKET_NOT_CREATED",

    // Fallback
    CONTRACT_ERROR = "CONTRACT_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface TranslatedError {
    type: ErrorType;
    userMessage: string;
    technicalMessage?: string;
}

export const translateError = (error: unknown): TranslatedError => {
    // User Rejection Errors
    const userRejectionPatterns = [
        "user rejected",
        "user denied",
        "transaction rejected",
        "4001", // MetaMask error code for user rejection
    ];

    const insufficientFundsPatterns = [
        "insufficient funds",
        "not enough funds",
        "balance too low",
        "insufficient balance",
    ];

    const networkErrorPatterns = [
        "network error",
        "connection failed",
        "could not connect",
        "network unavailable",
    ];

    const transactionTimeoutPatterns = [
        "transaction timeout",
        "timed out",
        "timeout exceeded",
        "deadline exceeded",
    ];

    const httpRequestFailedPatterns = [
        "http request failed",
        "request failed",
        "failed to fetch",
        "failed to load",
    ];

    // Specific smart contract error translations
    const contractErrorMap: Record<string, TranslatedError> = {
        "InvalidBetDeadline()": {
            type: ErrorType.INVALID_BET_DEADLINE,
            userMessage:
                "The bet deadline is invalid. Please select a future date.",
        },
        "InvalidResolutionDeadline()": {
            type: ErrorType.INVALID_RESOLUTION_DEADLINE,
            userMessage:
                "The resolution deadline is invalid. It must be after the bet deadline.",
        },
        "InsufficientOutcomes()": {
            type: ErrorType.INSUFFICIENT_OUTCOMES,
            userMessage:
                "You must provide at least two outcomes for the market.",
        },
        "InsufficientFee()": {
            type: ErrorType.INSUFFICIENT_FEE,
            userMessage: "The provided fee is insufficient to create a market.",
        },
        "MarketAlreadyResolved()": {
            type: ErrorType.MARKET_ALREADY_RESOLVED,
            userMessage: "This market has already been resolved.",
        },
        "BettingDeadlinePassed()": {
            type: ErrorType.BETTING_DEADLINE_PASSED,
            userMessage:
                "The betting deadline has passed. You can no longer place bets.",
        },
        "BettingAmountCannotBeZero()": {
            type: ErrorType.BETTING_AMOUNT_ZERO,
            userMessage: "Betting amount cannot be zero.",
        },
        "InvalidOutcome()": {
            type: ErrorType.INVALID_OUTCOME,
            userMessage: "The selected outcome is invalid.",
        },
        "TooEarlyToResolve()": {
            type: ErrorType.TOO_EARLY_TO_RESOLVE,
            userMessage: "It is too early to resolve this market.",
        },
        "UnauthorizedOracle()": {
            type: ErrorType.UNAUTHORIZED_ORACLE,
            userMessage:
                "Unauthorized access. Only designated oracles can perform this action.",
        },
        "NoWinningsToClaim()": {
            type: ErrorType.NO_WINNINGS_TO_CLAIM,
            userMessage: "There are no winnings available to claim.",
        },
        "TransferFailed()": {
            type: ErrorType.TRANSFER_FAILED,
            userMessage: "Token transfer failed. Please try again.",
        },
        "MarketNotResolved()": {
            type: ErrorType.MARKET_NOT_RESOLVED,
            userMessage: "This market has not been resolved yet.",
        },
        "NoBetsOnWinningOutcome()": {
            type: ErrorType.NO_BETS_ON_WINNING_OUTCOME,
            userMessage: "No bets were placed on the winning outcome.",
        },
        "MarketNotCreated()": {
            type: ErrorType.MARKET_NOT_CREATED,
            userMessage: "The market has not been created successfully.",
        },
    };

    // Helper function to check error message
    const checkErrorMessage = (message: string, patterns: string[]) =>
        patterns.some((pattern) => message.toLowerCase().includes(pattern));

    // Convert error to string for checking
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for specific contract errors first
    for (const [errorSignature, translation] of Object.entries(
        contractErrorMap
    )) {
        if (errorMessage.includes(errorSignature)) {
            return {
                ...translation,
                technicalMessage: errorMessage,
            };
        }
    }

    // Determine error type
    if (checkErrorMessage(errorMessage, userRejectionPatterns)) {
        return {
            type: ErrorType.USER_REJECTED,
            userMessage:
                "Transaction was cancelled. Please try again if you wish to proceed.",
            technicalMessage: errorMessage,
        };
    }

    if (checkErrorMessage(errorMessage, insufficientFundsPatterns)) {
        return {
            type: ErrorType.INSUFFICIENT_FUNDS,
            userMessage:
                "Insufficient funds to complete this transaction. Please add more funds to your wallet.",
            technicalMessage: errorMessage,
        };
    }

    if (checkErrorMessage(errorMessage, networkErrorPatterns)) {
        return {
            type: ErrorType.NETWORK_ERROR,
            userMessage:
                "Network connection issue. Please check your internet and try again.",
            technicalMessage: errorMessage,
        };
    }

    if (checkErrorMessage(errorMessage, transactionTimeoutPatterns)) {
        return {
            type: ErrorType.TRANSACTION_TIMEOUT,
            userMessage:
                "Transaction confirmation timed out. Please check your transaction status in your wallet.",
            technicalMessage: errorMessage,
        };
    }

    if (checkErrorMessage(errorMessage, httpRequestFailedPatterns)) {
        return {
            type: ErrorType.HTTP_REQUEST_FAILED,
            userMessage:
                "Failed to connect to the blockchain network. Please check your connection and try again.",
            technicalMessage: errorMessage,
        };
    }

    // Default fallback for unknown errors
    return {
        type: ErrorType.UNKNOWN_ERROR,
        userMessage: "An unexpected error occurred. Please try again later.",
        technicalMessage: errorMessage,
    };
};

// Utility function to log errors (optional)
export const logError = (error: TranslatedError) => {
    console.error("Error Type:", error.type);
    console.error("Technical Message:", error.technicalMessage);
};

// Example usage in a try-catch block
export const handleContractError = (
    error: unknown,
    openModal?: (options: {
        message: string;
        type: "error" | "warning";
    }) => void
) => {
    const translatedError = translateError(error);

    // Optionally log the error
    logError(translatedError);

    // If a modal opening function is provided, use it
    if (openModal) {
        openModal({
            message: translatedError.userMessage,
            type: "error",
        });
    }

    return translatedError;
};
