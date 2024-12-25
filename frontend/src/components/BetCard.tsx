import React, { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { formatUnits } from "ethers";
import { Bet } from "@/hooks/useUserBets";
import { useMarketInfo } from "@/hooks/useMarketInfo";
import { mapMarketData, Market } from "@/utils/markets";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/util";

export enum BetStatus {
    Pending = 0,
    Won = 1,
    Lost = 2,
}

export const BetCard: React.FC<Bet> = ({
    amount,
    outcome,
    status,
    potentialWinnings,
    marketId,
}) => {
    const [loadedMarketInfo, setLoadedMarketInfo] = useState<Market | null>(
        null
    );

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
            default:
                return null;
        }
    };

    const { data: marketInfoData, error, isLoading } = useMarketInfo(marketId);
    const navigate = useNavigate();

    useEffect(() => {
        if (marketInfoData) {
            const mappedMarket = mapMarketData(marketInfoData, marketId);
            setLoadedMarketInfo(mappedMarket);
        }
    }, [marketInfoData]);

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
                {isLoading ? (
                    <p className="text-lg text-white font-bold text-left">Loading...</p>
                ) : error ? (
                    <p className="text-lg text-red-500 font-bold text-left">
                        Error loading market info
                    </p>
                ) : loadedMarketInfo ? (
                    <p className="text-lg text-white font-bold text-left">
                        {loadedMarketInfo.title}
                    </p>
                ) : (
                    <p className="text-lg text-gray-500 font-bold text-left">
                        No Market Info
                    </p>
                )}
                <span className="ml-auto">{getStatusLabel(status)}</span>
            </section>
            <section className="flex flex-col justify-between items-center w-2/3 space-y-2 lg:!flex-row lg:space-y-0">
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
                        {formatUnits(potentialWinnings, "ether")} BNB
                    </span>
                </p>
            </section>
            <section className="flex justify-between items-center w-full">
                <p
                    className={`flex space-x-2 text-sm text-left ${getClockColor(
                        status
                    )}`}
                >
                    <FaRegClock />
                    {isLoading ? (
                        <span className="text-gray-400">Loading...</span>
                    ) : error ? (
                        <span className=" text-red-500 ">
                            Error loading market info
                        </span>
                    ) : loadedMarketInfo ? (
                        <span className=" text-gray-400 ">
                            {formatDate(Number(loadedMarketInfo.betDeadline))}
                        </span>
                    ) : (
                        <span className=" text-gray-500 ">
                            No Deadline Info
                        </span>
                    )}
                </p>
                <p
                    className="cursor-pointer px-3 py-1 rounded-full ml-auto text-white bg-gray-700 transition-all duration-300 text-sm hover:bg-gray-900"
                    onClick={() => {
                        navigate(`/markets/${marketId}`);
                    }}
                >
                    View
                </p>
            </section>
        </div>
    );
};
