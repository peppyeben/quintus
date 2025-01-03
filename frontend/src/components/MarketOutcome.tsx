import { useMarketBets } from "@/hooks/useMarketInfo";
import { formatUnits } from "ethers";

export const MarketOutcomeItem: React.FC<{
    outcome: string;
    marketId: bigint;
    winningOutcome: string;
}> = ({ outcome, marketId, winningOutcome }) => {
    const { data: marketBetData, isLoading } = useMarketBets(marketId, outcome);

    return (
        <button className="py-2 px-3 flex justify-between border w-full rounded-lg transition-all duration-300 hover:bg-[#202020] hover:bg-opacity-40">
            <span className="flex flex-col space-y-1 mr-auto">
                <span className="text-sm text-left">{outcome}</span>
                <span className="text-gray-600 text-sm text-left">
                    Pool Share:{" "}
                    {marketBetData
                        ? `${marketBetData[1]}%`
                        : isLoading
                        ? "Loading..."
                        : "N/A"}
                </span>
            </span>
            {outcome == winningOutcome && (
                <span className="bg-[#0c2712] text-xs text-white rounded-full px-5 py-[0.25rem] text-center font-bold mx-auto">
                    Won
                </span>
            )}
            <span className="flex flex-col space-y-1 ml-auto">
                <span className="text-sm text-right text-green-600">
                    {marketBetData
                        ? `Total Bets: ${formatUnits(marketBetData[0], 18)}`
                        : isLoading
                        ? "Loading..."
                        : "N/A"}
                </span>
                <span className="text-gray-600 text-sm text-left">
                    Pot. Return:{" "}
                    {marketBetData
                        ? marketBetData[1] > 0
                            ? `${(1 / (Number(marketBetData[1]) / 100)).toFixed(
                                  2
                              )}x`
                            : "—"
                        : isLoading
                        ? "Loading..."
                        : "N/A"}
                </span>
            </span>
        </button>
    );
};
