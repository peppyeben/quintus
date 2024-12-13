import React from "react";
import randomImage from "../assets/random-image.png";

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

export const FeaturedCard: React.FC<BetProps> = ({
    title,
    description,
    image,
    // totalPool,
    // category,
    // outcomes,
}) => {
    return (
        <div className="flex justify-center items-start rounded-xl p-3 max-w-[28rem] w-full h-[15rem] bg-[#0d0d0d] space-x-1 relative">
            <section className="flex flex-col justify-start items-start w-1/2 h-full">
                <p className="text-white text-lg font-bold text-left break-words">
                    {title}
                </p>
                <p className="text-gray-400 text-sm text-left break-words py-2 overflow-y-auto max-h-[6rem] pr-2 scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#333333] hover:scrollbar-thumb-[#444444]">
                    {description}
                </p>
            </section>
            <section className="relative w-1/2 h-full min-h-[9rem]">
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <img
                        src={image || randomImage}
                        alt={title}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            </section>
            <button className="absolute bottom-3 left-3 rounded-full text-sm px-4 py-1 text-white bg-[#1f1f1f] hover:scale-105 hover:bg-opacity-90">
                Place Bet
            </button>
        </div>
    );
};
