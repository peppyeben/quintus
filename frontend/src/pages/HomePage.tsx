import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FeaturedCard } from "../components/FeaturedCard";
import { PredictionMarkets } from "../components/PredictionMarkets";
// import { useMarkets } from "@/hooks/useMarkets";
import { Loader } from "lucide-react";
import { useMarkets } from "@/context/MarketsContext";

export const HomePage: React.FC = () => {
    const { markets, isLoading, error, filteredMarkets } = useMarkets();

    // Randomly select 3 markets
    const displayMarkets = useMemo(() => {
        // If less than or equal to 3 markets, return all
        if (markets.length <= 3) return markets;

        // Create a copy of markets to shuffle
        const shuffled = [...markets];

        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Return first 3 after shuffling
        return shuffled.slice(0, 3);
    }, [markets]);

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
                {displayMarkets.map((bet) => (
                    <FeaturedCard key={bet.id} {...bet} />
                ))}
            </motion.div>
            <motion.div className="flex flex-col justify-start space-y-4 py-4 w-full px-6">
                <p className="text-xl font-bold text-white mr-auto">
                    Prediction Markets
                </p>
                <div className="grid grid-cols-auto-fit w-full gap-4">
                    {filteredMarkets.map((bet) => (
                        <PredictionMarkets key={bet.id} {...bet} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default HomePage;
