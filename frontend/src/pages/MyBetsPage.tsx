import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BetCard } from "../components/BetCard";
import { usePotentialWinnings } from "@/hooks/usePotentialWinnings";
import QuintusMeta from "@/components/QuintusMeta";

export const MyBetsPage: React.FC = () => {
    const { potentialWinnings, isLoading, error, refetchPotentialWinnings } =
        usePotentialWinnings();

    useEffect(() => {
        const fetchPW = async () => {
            await refetchPotentialWinnings();
        };

        fetchPW();
    }, [refetchPotentialWinnings]);

    if (isLoading) {
        return (
            <motion.div className="flex flex-col space-y-5 justify-start items-center py-6">
                <p className="text-white">Loading bets...</p>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div className="flex flex-col space-y-5 justify-start items-center py-6">
                <p className="text-red-500">
                    Error loading bets: {error.message}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div className="flex flex-col space-y-5 justify-start items-center py-6">
            <QuintusMeta
                title={`My bets | Quintus Markets`}
                description={`View all your bets on Quintus.`}
            />
            <motion.div className="flex flex-col justify-start space-y-4 py-4 w-full px-6">
                <p className="text-xl font-bold text-white mr-auto pl-6 lg:pl-0">
                    My Bets
                </p>
                {potentialWinnings.length === 0 ? (
                    <p className="text-white text-center">No bets found</p>
                ) : (
                    <div className="flex flex-col space-y-2 w-full gap-4">
                        {potentialWinnings.map((bet, index) => (
                            <BetCard
                                key={index}
                                marketId={bet.marketId}
                                amount={bet.amount}
                                outcome={bet.outcome}
                                status={bet.status}
                                potentialWinnings={bet.potentialWinnings}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
