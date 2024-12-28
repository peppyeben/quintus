import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { FaRegClock } from "react-icons/fa";
import { TbBrandBinance } from "react-icons/tb";
import { ChevronDown } from "lucide-react";
import { formatDate, MARKET_CATEGORY } from "@/utils/util";
import { handleContractError } from "@/utils/errors";
import { usePlaceBet } from "@/hooks/usePlaceBet";
import { useCustomModal } from "@/context/CustomModalContext";
import { parseEther } from "ethers";
import { useMarkets } from "@/context/MarketsContext";
import { MarketOutcomeItem } from "@/components/MarketOutcome";
import { useClaimWinnings } from "@/hooks/useClaimWinnings";
import { useResolveMarket } from "@/hooks/useResolveMarket";
import ShareButton from "@/components/ShareButton";
import { useMarketClaimStatus } from "@/hooks/useMarketInfo";
import { useAccount } from "wagmi";
import { useUserBets } from "@/hooks/useUserBets";
import QuintusMeta from "@/components/QuintusMeta";

export const MarketDetailsPage: React.FC = () => {
    const account = useAccount();
    const { markets, isLoading, error } = useMarkets();
    const { id } = useParams<{ id: string }>();
    const [pageError, setPageError] = useState<string | null>(null);

    // Bet-related states
    const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
    const [betAmount, setBetAmount] = useState<bigint>(0n);
    const [userHasBetsOnMarket, setUserHasBetsOnMarket] =
        useState<boolean>(false);

    const { placeBet } = usePlaceBet();
    const { claimWinnings } = useClaimWinnings();
    const { resolveMarket } = useResolveMarket();
    const { fetchUserBetsForSpecificMarket } = useUserBets(
        id !== undefined ? BigInt(id) : undefined
    );

    const marketClaimStatus = useMarketClaimStatus(
        id !== undefined ? BigInt(id) : undefined,
        account.address
    );

    // When accessing the data
    const hasClaimed = marketClaimStatus.data ?? false;

    useEffect(() => {
        if (account.isConnected && id !== undefined) {
            marketClaimStatus.refetch();

            fetchUserBetsForSpecificMarket().then((res) => {
                if (res && res.length > 0) {
                    setUserHasBetsOnMarket(true);
                }
            });
        }
    }, [account, id]);

    const { openModal } = useCustomModal();

    // Convert id to number for comparison
    const marketId = useMemo(() => {
        return id ? Number(id) : null;
    }, [id]);

    // Find the specific market by its ID
    const market = useMemo(() => {
        return markets.find((m) => Number(m.id) == marketId);
    }, [markets, marketId]);

    useEffect(() => {
        if (error) {
            setPageError(handleContractError(error.message).userMessage);
        }
    }, [error]);

    // Handle bet amount change
    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        try {
            // Convert to smallest unit (assuming 4 decimal places)
            const amount = Math.floor(Number(value) * 10000);
            setBetAmount(BigInt(amount));
        } catch (error) {
            setBetAmount(0n);
            console.error(error);
        }
    };

    // Handle place bet
    const handlePlaceBet = async () => {
        if (!selectedOutcome) {
            openModal({
                message: "Please select an outcome before placing a bet",
                type: "error",
            });
            return;
        }

        if (!betAmount || betAmount <= 0n) {
            openModal({
                message: "Please enter a valid bet amount",
                type: "error",
            });
            return;
        }

        if (!market) {
            openModal({
                message: "Market not found",
                type: "error",
            });
            return;
        }

        await placeBet({
            marketId: Number(market.id),
            outcome: selectedOutcome,
            betAmount: parseEther(String(Number(betAmount) / 1e4)),
            openModal,
            onSuccess: () => {
                // Reset form after successful bet
                setSelectedOutcome(null);
                setBetAmount(0n);
            },
        });
    };

    const handleClaimWinnings = async () => {
        if (!market) {
            openModal({
                message: "Market not found",
                type: "error",
            });
            return;
        }
        await claimWinnings({
            marketId: Number(market.id),
            openModal,
            onSuccess: () => {
                setSelectedOutcome(null);
                setBetAmount(0n);
            },
        });
    };

    const handleResolveMarket = async () => {
        if (!market) {
            openModal({
                message: "Market not found",
                type: "error",
            });
            return;
        }

        await resolveMarket({
            marketId: Number(market.id),
            openModal,
            onSuccess: () => {},
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col space-y-5 justify-center items-center min-h-screen py-6 text-white"
            >
                Loading market details...
            </motion.div>
        );
    }

    // Error state
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col space-y-5 justify-center mx-auto items-center min-h-screen py-6 text-white w-[20rem]"
            >
                Error loading market: {pageError}
            </motion.div>
        );
    }

    // Market not found
    if (!market) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col space-y-5 justify-center items-center min-h-screen py-6 text-white"
            >
                Market Not Found
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col space-y-5 justify-start items-center py-6 w-full px-2 mx-auto lg:w-1/2 lg:px-0"
        >
            <motion.div className="flex flex-col justify-start space-y-6 py-4 w-full max-w-4xl px-6 bg-[#0d0d0d]">
                <QuintusMeta
                    title={`${market.title} | Quintus Markets`}
                    description={`Bet on ${market.title} - ${market.description}`}
                />

                <section className="flex w-full justify-between items-center">
                    <p className="bg-white text-black rounded-full py-1 px-3 text-xs">
                        {MARKET_CATEGORY[Number(market.category)] || "Unknown"}
                    </p>

                    <ShareButton />
                </section>

                {/* Market Header */}
                <div className="flex flex-col w-full justify-between items-start md:items-center space-y-5">
                    <p className="text-2xl font-bold text-white text-left">
                        {market.title}
                    </p>
                    <p
                        className="text-gray-300 text-left py-1 text-sm break-words"
                        onClick={() =>
                            window.open(
                                `https://testnet.bscscan.com/address/${market.creator}`,
                                "_blank"
                            )
                        }
                    >
                        Created by:<> </>
                        <span className="cursor-pointer text-blue-400 hover:text-opacity-60 lg:hidden">
                            {`${String(market.creator).slice(0, 5)}...${String(
                                market.creator
                            ).slice(-5)}`}
                        </span>
                        <span className="cursor-pointer text-blue-400 hover:text-opacity-60 hidden lg:!flex">
                            {`${String(market.creator)}`}
                        </span>
                    </p>
                    <p className="py-[0.05rem] bg-gray-600 w-full rounded-xl"></p>
                    <p className="text-gray-300 text-left pt-5">
                        {market.description}
                    </p>
                </div>

                <div className="rounded-lg py-4 lg:p-4 flex flex-col space-y-4 justify-between w-full">
                    <p className="flex text-sm flex-col justify-start lg:items-center lg:!flex-row">
                        <span className="flex space-x-2 mr-auto">
                            <FaRegClock className="text-gray-500 text-left " />
                            <span className="text-gray-500 text-left text-sm">
                                Bet Deadline
                            </span>
                        </span>
                        <span className="text-white text-left font-bold">
                            {formatDate(Number(market.betDeadline))}
                        </span>
                    </p>
                    <p className="flex text-sm flex-col justify-start lg:items-center lg:!flex-row">
                        <span className="flex space-x-2 mr-auto">
                            <FaRegClock className="text-gray-500 text-left " />

                            <span className="text-gray-500 text-left text-sm">
                                Resolution Start Time
                            </span>
                        </span>
                        <span className="text-white text-left font-bold">
                            {formatDate(Number(market.resolutionDeadline))}
                        </span>
                    </p>
                </div>

                <div className="text-white flex flex-col w-full justify-center items-center space-y-3">
                    <p className="flex w-full justify-between items-center pb-3">
                        <span className="font-bold mr-auto">
                            {!market.resolved &&
                                Number(market.betDeadline) >
                                    Date.now() / 1000 && (
                                    <span>Select Outcome</span>
                                )}
                            {!market.resolved &&
                                Number(market.betDeadline) <
                                    Date.now() / 1000 && <span>Active</span>}
                            {market.resolved && <span>Closed</span>}
                        </span>
                        {!market.resolved && (
                            <button
                                disabled={
                                    Number(market.resolutionDeadline) >
                                    Date.now() / 1000
                                }
                                className="ml-auto px-4 py-1 text-sm bg-white text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleResolveMarket}
                            >
                                Resolve Market
                            </button>
                        )}
                        {market.resolved && (
                            <span className="text-white bg-[#1f1f1f] text-sm px-4 py-1 rounded-lg">
                                Resolved
                            </span>
                        )}
                    </p>
                    {!market.resolved &&
                        Number(market.betDeadline) > Date.now() / 1000 && (
                            <div className="w-full relative">
                                <button
                                    onClick={() =>
                                        setIsOutcomeOpen(!isOutcomeOpen)
                                    }
                                    className="w-full text-left text-xs px-3 py-2 rounded-md 
                            border border-neutral-700 bg-neutral-900
                            flex items-center justify-between
                            hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <span
                                        className={
                                            selectedOutcome
                                                ? "text-white"
                                                : "text-neutral-500"
                                        }
                                    >
                                        {selectedOutcome || "Select Outcome"}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform ${
                                            isOutcomeOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {isOutcomeOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {market.outcomes.map((outcome) => (
                                            <div
                                                key={outcome}
                                                onClick={() => {
                                                    setSelectedOutcome(outcome);
                                                    setIsOutcomeOpen(false);
                                                }}
                                                className="px-3 py-1 cursor-pointer hover:bg-neutral-800 text-white"
                                            >
                                                {outcome}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    {market.outcomes.map((outcome) => (
                        <MarketOutcomeItem
                            key={outcome}
                            outcome={outcome}
                            marketId={BigInt(market.id)}
                            winningOutcome={market.winningOutcome}
                        />
                    ))}
                </div>
                {!market.resolved &&
                    Number(market.betDeadline) > Date.now() / 1000 && (
                        <div className="flex flex-col space-y-2 text-white">
                            <p className="font-bold mr-auto">Bet Amount</p>
                            <p className="relative w-full border border-neutral-700 rounded-lg p-1">
                                <span className="absolute top-[0.75rem] left-2">
                                    <TbBrandBinance className="text-[#F3BA2F] text-2xl m-auto" />
                                </span>
                                <input
                                    type="number"
                                    className="w-full py-2 pl-10 pr-3 text-white placeholder:text-sm border-none outline-none appearance-none bg-transparent"
                                    placeholder="Enter bet amount"
                                    min={0}
                                    step={0.0001}
                                    onChange={handleBetAmountChange}
                                />
                            </p>
                        </div>
                    )}
                {!market.resolved &&
                    Number(market.betDeadline) > Date.now() / 1000 && (
                        <div className="flex w-full">
                            <button
                                onClick={handlePlaceBet}
                                disabled={
                                    !selectedOutcome ||
                                    !betAmount ||
                                    betAmount <= 0n
                                }
                                className="w-full bg-white text-black py-2 rounded-xl 
                           hover:bg-gray-300 transition-colors duration-300 font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {!selectedOutcome
                                    ? "Select Outcome"
                                    : "Place Bet"}
                            </button>
                        </div>
                    )}
                {market.resolved &&
                    userHasBetsOnMarket &&
                    (!hasClaimed ? (
                        <div className="flex w-full">
                            <button
                                onClick={handleClaimWinnings}
                                disabled={!market.resolved}
                                className="w-full bg-white text-black py-2 rounded-xl 
                           hover:bg-gray-300 transition-colors duration-300 font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Claim Winnings
                            </button>
                        </div>
                    ) : (
                        <div className="flex w-full">
                            <button
                                disabled
                                className="w-full bg-white text-black py-2 rounded-xl 
                           hover:bg-gray-300 transition-colors duration-300 font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Winnings Claimed
                            </button>{" "}
                        </div>
                    ))}
            </motion.div>
        </motion.div>
    );
};

export default MarketDetailsPage;
