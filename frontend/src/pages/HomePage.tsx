import React from "react";
import { motion } from "framer-motion";
import { generateRandomBets } from "../utils/bets";
import { FeaturedCard } from "../components/FeaturedCard";
import { PredictionMarkets } from "../components/PredictionMarkets";
export const HomePage: React.FC = () => {
    const randomBets = generateRandomBets(3); // Generate 3 random bets
    const randomPredictionMarketsBets = generateRandomBets(10); // Generate 3 random bets

    return (
        <motion.div className="flex flex-col space-y-5 justify-start items-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 px-6 grid grid-cols-auto-fit gap-4 w-full mx-auto"
            >
                {randomBets.map((bet, index) => (
                    <FeaturedCard key={index} {...bet} />
                ))}
            </motion.div>
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
