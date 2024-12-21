import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedOutcomesProps {
    outcomes: string[];
}

export const PaginatedOutcomes: React.FC<PaginatedOutcomesProps> = ({
    outcomes,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextOutcome = () => {
        setCurrentIndex((prev) => (prev + 1) % outcomes.length);
    };

    const prevOutcome = () => {
        setCurrentIndex(
            (prev) => (prev - 1 + outcomes.length) % outcomes.length
        );
    };

    return (
        <div className="flex flex-col space-y-1">
            <span className="text-gray-200 text-sm">Outcomes</span>
            <div
                className="flex items-center justify-between space-x-2 w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={prevOutcome}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    disabled={outcomes.length <= 1}
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex-1 text-center">
                    <span className="inline-block rounded-full px-4 py-1.5 bg-[#1f1f1f] text-white text-sm min-w-[100px] break-words">
                        {outcomes[currentIndex]}
                    </span>
                </div>

                <button
                    onClick={nextOutcome}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    disabled={outcomes.length <= 1}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="flex justify-center space-x-1 pt-1">
                {outcomes.map((_, index) => (
                    <div
                        key={index}
                        className={`w-1 h-1 rounded-full transition-colors ${
                            index === currentIndex ? "bg-white" : "bg-gray-600"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};
