import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BetCard } from "../components/BetCard";
import { useUserBets } from "@/hooks/useUserBets";

export const MyBetsPage: React.FC = () => {
    const { userBets, isLoading, error, refetchUserBets } = useUserBets();

    useEffect(() => {
        refetchUserBets().then((res) => {
            console.log(res);
        });
    }, []);

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
            <motion.div className="flex flex-col justify-start space-y-4 py-4 w-full px-6">
                <p className="text-xl font-bold text-white mr-auto">My Bets</p>
                {userBets.length === 0 ? (
                    <p className="text-white text-center">No bets found</p>
                ) : (
                    <div className="flex flex-col space-y-2 w-full gap-4">
                        {userBets.map((bet, index) => (
                            <BetCard key={index} {...bet} />
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
