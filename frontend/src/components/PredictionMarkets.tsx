import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Market } from "@/utils/markets";
import { MARKET_CATEGORY } from "@/utils/util";
import { PaginatedOutcomes } from "./PaginatedOutcomes";
import { TbBrandBinance } from "react-icons/tb";
import { usePlaceBet } from "@/hooks/usePlaceBet";
import { useCustomModal } from "@/context/CustomModalContext";
import { parseEther, formatUnits } from "ethers";

interface PredictionMarketsProps extends Market {
    openModal?: (options: {
        message: string;
        type: "info" | "success" | "error";
    }) => void;
}

export const PredictionMarkets: React.FC<PredictionMarketsProps> = ({
    title,
    description,
    category,
    outcomes,
    id,
    totalPool,
    resolved,
    betDeadline,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
    const [betAmount, setBetAmount] = useState<bigint>(0n);
    const navigate = useNavigate();
    const { placeBet } = usePlaceBet();
    const { openModal } = useCustomModal();

    const handlePlaceBet = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!selectedOutcome) {
            openModal?.({
                message: "Please select an outcome before placing a bet",
                type: "error",
            });
            return;
        }

        if (!betAmount || betAmount <= 0n) {
            openModal?.({
                message: "Please enter a valid bet amount",
                type: "error",
            });
            return;
        }

        await placeBet({
            marketId: Number(id),
            outcome: selectedOutcome,
            betAmount: parseEther(String(Number(betAmount) / 1e4)),
            openModal,
            onSuccess: () => {
                // Reset form after successful bet
                setSelectedOutcome(null);
                setBetAmount(0n);
            },
        });
    };

    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        try {
            // Convert to smallest unit (assuming 4 decimal places)
            const amount = Math.floor(Number(value) * 10000);
            setBetAmount(BigInt(amount));
        } catch (error) {
            setBetAmount(0n);
            console.error(error);
        }
    };

    return (
        <div
            onClick={() => navigate(`/markets/${id}`)}
            className="flex flex-col cursor-pointer justify-start items-start rounded-xl p-3 h-fit w-full lg:max-w-[20rem] max-h-[28rem] bg-[#0d0d0d] space-y-2 transition-all duration-300 hover:scale-95"
        >
            <section className="flex w-full justify-start items-center">
                <p className="bg-white text-black rounded-full py-[0.075rem] px-3 text-xs">
                    {MARKET_CATEGORY[Number(category)].toLowerCase()}
                </p>
            </section>
            <section className="flex flex-col justify-start items-center w-full space-y-2">
                <p className="text-white text-lg font-bold text-left mr-auto break-words">
                    {title}
                </p>
                <p className="text-gray-400 text-sm text-left mr-auto break-words py-2 overflow-y-auto max-h-[6rem] pr-2 scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#333333] hover:scrollbar-thumb-[#444444]">
                    {description}
                </p>
                <section className="flex justify-between w-full pt-4">
                    <p className="flex flex-col items-start space-y-1">
                        <span className="text-gray-200">Total Pool</span>
                        <span className="text-white font-bold flex space-x-1">
                            <TbBrandBinance className="text-[#F3BA2F] text-lg m-auto" />
                            <span>{formatUnits(totalPool.toString())}</span>
                        </span>
                    </p>
                    <PaginatedOutcomes outcomes={outcomes} />
                </section>
                {!resolved && Number(betDeadline) > Date.now() / 1000 && (
                    <>
                        <section
                            className="w-full flex justify-center items-center relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="w-full relative"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <button
                                    className="w-full text-left text-xs px-3 py-2 rounded-md 
                            border border-neutral-700 bg-neutral-900
                            flex items-center justify-between
                            hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <span
                                        className={
                                            selectedOutcome
                                                ? "text-white"
                                                : "text-neutral-500"
                                        }
                                    >
                                        {selectedOutcome || "Select Outcome"}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform ${
                                            isOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {outcomes.map((outcome) => (
                                            <div
                                                key={outcome}
                                                onClick={() => {
                                                    setSelectedOutcome(outcome);
                                                    setIsOpen(false);
                                                }}
                                                className="px-3 py-1 cursor-pointer hover:bg-neutral-800 text-white"
                                            >
                                                {outcome}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <div
                            className="flex flex-col space-y-2 text-white w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="relative w-full border border-neutral-700 rounded-lg p-1">
                                <span className="absolute top-[0.75rem] left-2">
                                    <TbBrandBinance className="text-[#F3BA2F] text-xl m-auto" />
                                </span>
                                <input
                                    type="number"
                                    className="w-full py-1 pl-10 pr-3 text-white placeholder:text-sm border-none outline-none appearance-none bg-transparent"
                                    placeholder="Enter bet amount"
                                    min={0}
                                    step={0.0001}
                                    onChange={handleBetAmountChange}
                                />
                            </p>
                        </div>
                        <p className="mr-auto w-full" onClick={handlePlaceBet}>
                            <button
                                className="rounded-xl w-full mt-auto text-sm px-4 py-2 text-white bg-[#1f1f1f] 
                            hover:scale-105 hover:bg-opacity-90 disabled:opacity-50 disabled:hover:scale-100"
                                disabled={
                                    !selectedOutcome ||
                                    !betAmount ||
                                    betAmount <= 0n
                                }
                            >
                                {!selectedOutcome
                                    ? "Select Outcome"
                                    : "Place Bet"}
                            </button>
                        </p>
                    </>
                )}
            </section>
        </div>
    );
};
