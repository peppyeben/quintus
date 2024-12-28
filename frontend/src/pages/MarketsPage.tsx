import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PredictionMarkets } from "../components/PredictionMarkets";
import { useMarkets } from "@/context/MarketsContext";
import { MARKET_CATEGORY } from "@/utils/util";
import QuintusMeta from "@/components/QuintusMeta";

export const MarketsPage = () => {
    const {
        markets,
        isLoading,
        error,
        filteredMarkets,
        setMarketCategory,
        filteredMarketsByCategory,
        searchTerm,
        setSearchTerm,
    } = useMarkets();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!selectedCategory) {
            setMarketCategory(-1n);
            return;
        }
        setSearchTerm("");
        const categoryIndex = MARKET_CATEGORY.indexOf(
            selectedCategory.toUpperCase()
        );
        setMarketCategory(BigInt(categoryIndex));
    }, [selectedCategory]);

    useEffect(() => {
        if (searchTerm) {
            setSelectedCategory(null);
            setMarketCategory(-1n);
        }
    }, [searchTerm]);

    const renderMarkets = () => {
        if (selectedCategory) {
            return filteredMarketsByCategory.length > 0 ? (
                <div className="grid grid-cols-auto-fit w-full gap-4">
                    {filteredMarketsByCategory.map((bet) => (
                        <PredictionMarkets key={bet.id} {...bet} />
                    ))}
                </div>
            ) : (
                <div className="text-white">
                    No {selectedCategory} Markets Available
                </div>
            );
        }

        if (filteredMarkets.length > 0) {
            return (
                <div className="grid grid-cols-auto-fit w-full gap-4">
                    {filteredMarkets.map((bet) => (
                        <PredictionMarkets key={bet.id} {...bet} />
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col space-y-5 justify-start items-center py-6">
            <QuintusMeta
                title={`View all markets | Quintus Markets`}
                description={`View all prediction markets on Quintus.`}
            />
            <div className="flex flex-col justify-start space-y-4 py-4 w-full px-6">
                <p className="text-xl font-bold text-white mr-auto">
                    Prediction Markets
                </p>

                <div className="flex w-[10rem] justify-between items-center pr-4">
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
                                        selectedCategory
                                            ? "text-white"
                                            : "text-neutral-500"
                                    }
                                >
                                    {selectedCategory || "Select Category"}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 transition-transform ${
                                        isOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {MARKET_CATEGORY.map((outcome) => (
                                        <div
                                            key={outcome}
                                            onClick={() => {
                                                setSelectedCategory(outcome);
                                                setIsOpen(false);
                                            }}
                                            className="px-3 py-1 cursor-pointer hover:bg-neutral-800 text-white"
                                        >
                                            {outcome.toLowerCase()}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {isLoading ? (
                    <div>Loading markets...</div>
                ) : error ? (
                    <div>Error: {error.message}</div>
                ) : markets.length > 0 ? (
                    renderMarkets()
                ) : (
                    <div>No Markets Available</div>
                )}
            </div>
        </div>
    );
};

export default MarketsPage;
