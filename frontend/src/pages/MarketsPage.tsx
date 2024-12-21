import React from "react";
import { motion } from "framer-motion";
import { PredictionMarkets } from "../components/PredictionMarkets";
import { useMarkets } from "@/hooks/useMarkets";

export const MarketsPage: React.FC = () => {
    const { markets, isLoading, error } = useMarkets();

    return (
        <motion.div className="flex flex-col space-y-5 justify-start items-center py-6">
            <motion.div className="flex flex-col justify-start space-y-4 py-4 w-full px-6">
                <p className="text-xl font-bold text-white mr-auto">
                    Prediction Markets
                </p>
                {isLoading ? (
                    <div>Loading markets...</div>
                ) : error ? (
                    <div>Error: {error.message}</div>
                ) : markets.length > 0 ? (
                    <div className="grid grid-cols-auto-fit w-full gap-4">
                        {markets.map((bet) => (
                            <PredictionMarkets key={bet.id} {...bet} />
                        ))}
                    </div>
                ) : (
                    <div>No Markets Available</div>
                )}
            </motion.div>
        </motion.div>
    );
};
