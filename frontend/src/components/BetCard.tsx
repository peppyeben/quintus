import React, { useState } from "react";
import { FaRegClock } from "react-icons/fa";

interface BetProps {
    id: string;
    title: string;
    description: string;
    image: string;
    deadline: number;
    totalPool: number;
    category: string;
    outcomes: string[];
}

export const BetCard: React.FC<BetProps> = ({
    title,
    // description,
    // image,
    // totalPool,
    // category,
    outcomes,
    deadline,
}) => {
    const [status] = useState(Math.floor(Math.random() * 3)); // Generates 0, 1, or 2

    const getStatusLabel = () => {
        switch (status) {
            case 0:
                return (
                    <p className="text-white px-4 py-1 w-20 rounded-full bg-blue-700 text-sm bg-opacity-40">
                        Active
                    </p>
                );
            case 1:
                return (
                    <p className="text-white px-4 py-1 w-20 rounded-full bg-red-700 text-sm bg-opacity-40">
                        Lost
                    </p>
                );
            case 2:
                return (
                    <p className="text-white px-4 py-1 w-20 rounded-full bg-green-700 text-sm bg-opacity-40">
                        Won
                    </p>
                );
            default:
                return null;
        }
    };

    const getClockColor = () => {
        switch (status) {
            case 0:
                return "text-blue-700";
            case 1:
                return "text-red-700";
            case 2:
                return "text-green-700";
            default:
                return "text-gray-400";
        }
    };

    return (
        <div className="w-full rounded-xl flex flex-col py-3 px-8 bg-[#0d0d0d] space-y-7">
            <section className="flex w-full justify-between items-center">
                <p className="text-lg text-white font-bold">{title}</p>
                {getStatusLabel()}
            </section>
            <section className="flex justify-between items-center w-2/3">
                <p className="flex flex-col items-center self-start space-y-1">
                    <span className="text-gray-400 mr-auto">Outcome</span>
                    <span className="text-white mr-auto">
                        {outcomes[Math.floor(Math.random() * outcomes.length)]}
                    </span>
                </p>
                <p className="flex flex-col items-center self-start space-y-1">
                    <span className="text-gray-400 mr-auto">Bet Amount</span>
                    <span className="text-white mr-auto">0.15BNB</span>
                </p>
                <p className="flex flex-col items-center self-start space-y-1">
                    <span className="text-gray-400 mr-auto">
                        Potential Winnings
                    </span>
                    <span className="text-white mr-auto">0.15BNB</span>
                </p>
            </section>
            <section className="flex justify-start items-center">
                <p className={`flex space-x-2 text-sm ${getClockColor()}`}>
                    <FaRegClock />
                    <span className="text-gray-400">
                        {new Date(deadline).toUTCString()}
                    </span>
                </p>
            </section>
        </div>
    );
};
