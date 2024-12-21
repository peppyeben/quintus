import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Market } from "@/utils/markets";
import { MARKET_CATEGORY } from "@/utils/util";
import { PaginatedOutcomes } from "./PaginatedOutcomes";
import { TbBrandBinance } from "react-icons/tb";

export const PredictionMarkets: React.FC<Market> = ({
    title,
    description,
    category,
    outcomes,
    id,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/markets/${id}`)}
            className="flex flex-col cursor-pointer justify-center items-start rounded-xl p-3 max-w-[20rem] max-h-[28rem] bg-[#0d0d0d] space-y-2"
        >
            <section className="flex w-full justify-start items-center">
                <p className="bg-white text-black rounded-full py-1 px-3 text-xs">
                    {MARKET_CATEGORY[Number(category)].toLowerCase()}
                </p>
            </section>
            {/* <section className="relative w-full h-full max-h-[20rem]">
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <img
                        src={image || randomImage}
                        alt={title}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            </section> */}
            <section className="flex flex-col justify-start items-center w-full space-y-2">
                <p className="text-white text-lg font-bold text-left mr-auto break-words">
                    {title}
                </p>
                <p className="text-gray-400 text-sm text-left mr-auto break-words py-2 overflow-y-auto max-h-[6rem] pr-2 scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#333333] hover:scrollbar-thumb-[#444444]">
                    {description}
                </p>
                <section className="flex justify-between w-full pt-4">
                    <p className="flex flex-col items-start space-y-1">
                        <span className=" text-gray-200 ">Total Pool</span>
                        <span className="text-white font-bold">
                            {/* ${totalPool} */}
                            $300
                        </span>
                    </p>
                    <PaginatedOutcomes outcomes={outcomes} />
                </section>
                <section
                    className="w-full flex justify-center items-center relative"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
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
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
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
                        />
                    </p>
                </div>
                <p
                    className="mr-auto w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <button className="rounded-xl w-full mt-auto text-sm px-4 py-2 text-white bg-[#1f1f1f] hover:scale-105 hover:bg-opacity-90">
                        Place Bet
                    </button>
                </p>
            </section>
        </div>
    );
};
