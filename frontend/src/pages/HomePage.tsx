import React from "react";
import { motion } from "framer-motion";
import { generateRandomBets } from "../utils/bets";
import { FeaturedCard } from "../components/FeaturedCard";
// import { FaWallet, FaShieldAlt, FaUsers } from "react-icons/fa";
// import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
    const randomBets = generateRandomBets(3); // Generate 3 random bets

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 px-6 flex space-x-2 w-full"
        >
            {randomBets.map((bet, index) => (
                <FeaturedCard key={index} {...bet} />
            ))}
        </motion.div>
    );
};
