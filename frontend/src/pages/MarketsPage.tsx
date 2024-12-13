import React from "react";
import { motion } from "framer-motion";
import { PredictionMarkets } from "../components/PredictionMarkets";
import { getMarkets } from "@/utils/bets";

export const MarketsPage: React.FC = () => {
    const randomPredictionMarketsBets = getMarkets(10);

    return (
        <motion.div className="flex flex-col space-y-5 justify-start items-center py-6">
            <motion.div className="flex flex-col justify-start space-y-4 py-4 w-full px-6">
                <p className="text-xl font-bold text-white mr-auto">
                    Prediction Markets
                </p>
                <div className="grid grid-cols-auto-fit w-full gap-4">
                    {randomPredictionMarketsBets.map((bet, index) => (
                        <PredictionMarkets key={index} {...bet} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};
