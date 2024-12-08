import React from "react";
import randomImage from "../assets/random-image.png";

interface BetProps {
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
    totalPool,
    category,
    outcomes,
}) => {
    return (
        <div className="flex justify-center items-start rounded-xl p-3 w-[22rem] bg-[#0d0d0d] space-x-1">
            <section className="flex flex-col justify-start items-center w-1/2">
                <p className="text-white text-lg font-bold text-left mr-auto">
                    {title}
                </p>
                <p className="text-gray-400 text-sm text-left">{description}</p>
                <p className="pt-8 mr-auto">
                    <button className="rounded-full mt-auto text-sm px-4 py-1 text-white bg-[#1f1f1f] hover:scale-105 hover:bg-opacity-90">
                        Place Bet
                    </button>
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
        </div>
    );
};
