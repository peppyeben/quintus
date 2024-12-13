import React from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { getMarkets } from "@/utils/bets";
import { FaRegClock } from "react-icons/fa";
import { TbBrandBinance } from "react-icons/tb";

export const MarketDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Find the specific market by its ID
    const markets = getMarkets(10);
    const market = markets.find((m) => m.id === id);

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
            className="flex flex-col space-y-5 justify-start items-center py-6 w-1/2 mx-auto "
        >
            <motion.div className="flex flex-col justify-start space-y-6 py-4 w-full max-w-4xl px-6 bg-[#0d0d0d]">
                <section className="flex w-full justify-start items-center">
                    <p className="bg-white text-black rounded-full py-1 px-3 text-xs">
                        {market.category}
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
                    <p
                        className={`flex  text-sm flex-col justify-start items-center `}
                    >
                        <span className="flex space-x-2 mr-auto">
                            <FaRegClock className="text-gray-500 text-left " />
                            <span className="text-gray-500 text-left text-sm">
                                Deadline
                            </span>
                        </span>
                        <span className="text-white text-left font-bold">
                            {new Date(market.deadline).toUTCString()}
                        </span>
                    </p>
                    <p
                        className={`flex  text-sm flex-col justify-start items-center `}
                    >
                        <span className="flex space-x-2 mr-auto">
                            <span className="text-gray-500 text-left text-sm">
                                Total Pool
                            </span>
                        </span>
                        <span className="text-white text-left font-bold">
                            ${market.totalPool}
                        </span>
                    </p>
                </div>

                <div className="text-white flex flex-col w-full justify-center items-center space-y-2">
                    <p className="font-bold mr-auto">Select Outcome</p>
                    <button className="py-2 px-3 flex justify-between border w-full rounded-lg transition-all duration-300 hover:bg-[#202020] hover:bg-opacity-40">
                        <span className="flex flex-col space-y-1 mr-auto">
                            <span className="text-sm text-left">
                                {market.outcomes[0]}
                            </span>
                            <span className="text-gray-600 text-sm text-left">
                                Pool Share: 58%
                            </span>
                        </span>
                        <span className="flex flex-col space-y-1 ml-auto">
                            <span className="text-sm text-right text-green-600">
                                1.8
                            </span>
                            <span className="text-gray-600 text-sm text-left">
                                Current Odds
                            </span>
                        </span>
                    </button>
                    <button className="py-2 px-3 flex justify-between border w-full rounded-lg transition-all duration-300 hover:bg-[#202020] hover:bg-opacity-40">
                        <span className="flex flex-col space-y-1 mr-auto">
                            <span className="text-sm text-left">
                                {market.outcomes[1]}
                            </span>
                            <span className="text-gray-600 text-sm text-left">
                                Pool Share: 42%
                            </span>
                        </span>
                        <span className="flex flex-col space-y-1 ml-auto">
                            <span className="text-sm text-right text-green-600">
                                2.2
                            </span>
                            <span className="text-gray-600 text-sm text-left">
                                Current Odds
                            </span>
                        </span>
                    </button>
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
