import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { FaRegClock } from "react-icons/fa";
import { TbBrandBinance } from "react-icons/tb";
import { useMarkets } from "@/hooks/useMarkets";
import { MARKET_CATEGORY } from "@/utils/util";
import { handleContractError } from "@/utils/errors";

export const MarketDetailsPage: React.FC = () => {
    const { markets, isLoading, error } = useMarkets();
    const { id } = useParams<{ id: string }>();
    const [pageError, setPageError] = React.useState<string | null>(null);

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

    // Convert timestamp to readable date
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toUTCString();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col space-y-5 justify-start items-center py-6 w-1/2 mx-auto "
        >
            <motion.div className="flex flex-col justify-start space-y-6 py-4 w-full max-w-4xl px-6 bg-[#0d0d0d]">
                <section className="flex w-full justify-start items-center">
                    <p className="bg-white text-black rounded-full py-1 px-3 text-xs">
                        {MARKET_CATEGORY[Number(market.category)] || "Unknown"}
                    </p>
                </section>

                {/* Market Header */}
                <div className="flex flex-col w-full justify-between items-start md:items-center space-y-5">
                    <p className="text-2xl font-bold text-white text-left">
                        {market.title}
                    </p>
                    <p className="py-[0.05rem] bg-gray-600 w-full rounded-xl"></p>
                    <p className="text-gray-300 text-left pt-5">
                        {market.description}
                    </p>
                </div>

                <div className="rounded-lg p-4 flex justify-between w-full">
                    <p className="flex text-sm flex-col justify-start items-center">
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
                    <p className="flex text-sm flex-col justify-start items-center">
                        <span className="flex space-x-2 mr-auto">
                            <span className="text-gray-500 text-left text-sm">
                                Resolution Deadline
                            </span>
                        </span>
                        <span className="text-white text-left font-bold">
                            {formatDate(Number(market.resolutionDeadline))}
                        </span>
                    </p>
                </div>

                <div className="text-white flex flex-col w-full justify-center items-center space-y-2">
                    <p className="font-bold mr-auto">Select Outcome</p>
                    {market.outcomes.map((outcome, index) => (
                        <button
                            key={index}
                            className="py-2 px-3 flex justify-between border w-full rounded-lg transition-all duration-300 hover:bg-[#202020] hover:bg-opacity-40"
                        >
                            <span className="flex flex-col space-y-1 mr-auto">
                                <span className="text-sm text-left">
                                    {outcome}
                                </span>
                                <span className="text-gray-600 text-sm text-left">
                                    Pool Share:{" "}
                                    {Math.floor(Math.random() * 100)}%
                                </span>
                            </span>
                            <span className="flex flex-col space-y-1 ml-auto">
                                <span className="text-sm text-right text-green-600">
                                    {(1 + Math.random() * 2).toFixed(2)}
                                </span>
                                <span className="text-gray-600 text-sm text-left">
                                    Current Odds
                                </span>
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col space-y-2 text-white">
                    <p className="font-bold mr-auto">Bet Amount</p>
                    <p className="relative w-full border rounded-lg p-1">
                        <span className="absolute top-[0.75rem] left-2">
                            <TbBrandBinance className="text-[#F3BA2F] text-2xl m-auto" />
                        </span>
                        <input
                            type="number"
                            className="w-full py-2 pl-10 pr-3 text-white border-none outline-none appearance-none bg-transparent"
                            placeholder="Enter bet amount"
                            min={0}
                            step={0.0001}
                        />
                    </p>
                </div>

                <div className="flex w-full">
                    <button
                        className="w-full bg-white text-black py-2 rounded-xl 
                           hover:bg-gray-300 transition-colors duration-300 font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Place Bet
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MarketDetailsPage;
