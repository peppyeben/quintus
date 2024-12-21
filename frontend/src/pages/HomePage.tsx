import React from "react";
import { motion } from "framer-motion";
import { FeaturedCard } from "../components/FeaturedCard";
import { PredictionMarkets } from "../components/PredictionMarkets";
import { useMarkets } from "@/hooks/useMarkets";
import { Loader } from "lucide-react";

export const HomePage: React.FC = () => {
    const { markets, isLoading, error } = useMarkets();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-4 px-6">
                <p className="text-red-500 text-lg text-center">
                    Failed to load markets: {error.message}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!markets || markets.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <p className="text-gray-400 text-lg">
                    No prediction markets available
                </p>
            </div>
        );
    }

    return (
        <motion.div className="flex flex-col space-y-5 justify-start items-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 px-6 grid grid-cols-auto-fit gap-4 w-full mx-auto"
            >
                {markets.map((bet, index) => (
                    <FeaturedCard key={bet.id || index} {...bet} />
                ))}
            </motion.div>
            <motion.div className="flex flex-col justify-start space-y-4 py-4 w-full px-6">
                <p className="text-xl font-bold text-white mr-auto">
                    Prediction Markets
                </p>
                <div className="grid grid-cols-auto-fit w-full gap-4">
                    {markets.map((bet, index) => (
                        <PredictionMarkets key={bet.id || index} {...bet} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};
