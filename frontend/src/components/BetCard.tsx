import React from "react";
import { FaRegClock } from "react-icons/fa";
import { formatUnits } from "ethers";

// Enum to match contract's BetStatus
export enum BetStatus {
    Pending = 0,
    Won = 1,
    Lost = 2,
}

export interface Bet {
    amount: bigint; // Bet amount (in tokens)
    outcome: string; // Chosen outcome (string)
    status: BetStatus; // Status of the bet (Pending/Won/Lost)
    potentialWinnings: bigint; // Potential winnings for the bet
}

export const BetCard: React.FC<Bet> = ({
    amount,
    outcome,
    status,
    potentialWinnings,
}) => {
    const getStatusLabel = (status: BetStatus) => {
        switch (status) {
            case BetStatus.Pending:
                return (
                    <p className="text-white px-4 py-1 w-20 rounded-full bg-blue-700 text-sm bg-opacity-40">
                        Active
                    </p>
                );
            case BetStatus.Lost:
                return (
                    <p className="text-white px-4 py-1 w-20 rounded-full bg-red-700 text-sm bg-opacity-40">
                        Lost
                    </p>
                );
            case BetStatus.Won:
                return (
                    <p className="text-white px-4 py-1 w-20 rounded-full bg-green-700 text-sm bg-opacity-40">
                        Won
                    </p>
                );
        }
    };

    const getClockColor = (status: BetStatus) => {
        switch (status) {
            case BetStatus.Pending:
                return "text-blue-700";
            case BetStatus.Lost:
                return "text-red-700";
            case BetStatus.Won:
                return "text-green-700";
            default:
                return "text-gray-400";
        }
    };

    return (
        <div className="w-full rounded-xl flex flex-col py-3 px-8 bg-[#0d0d0d] space-y-7">
            <section className="flex w-full justify-between items-center">
                <p className="text-lg text-white font-bold">Market Title</p>
                {getStatusLabel(status)}
            </section>
            <section className="flex justify-between items-center w-2/3">
                <p className="flex flex-col items-center self-start space-y-1">
                    <span className="text-gray-400 mr-auto">Outcome</span>
                    <span className="text-white mr-auto">{outcome}</span>
                </p>
                <p className="flex flex-col items-center self-start space-y-1">
                    <span className="text-gray-400 mr-auto">Bet Amount</span>
                    <span className="text-white mr-auto">
                        {formatUnits(amount, 18)} BNB
                    </span>
                </p>
                <p className="flex flex-col items-center self-start space-y-1">
                    <span className="text-gray-400 mr-auto">
                        Potential Winnings
                    </span>
                    <span className="text-white mr-auto">
                        {formatUnits(potentialWinnings, 18)} BNB
                    </span>
                </p>
            </section>
            <section className="flex justify-start items-center">
                <p
                    className={`flex space-x-2 text-sm ${getClockColor(
                        status
                    )}`}
                >
                    <FaRegClock />
                    <span className="text-gray-400">
                        Deadline Not Available
                    </span>
                </p>
            </section>
        </div>
    );
};
