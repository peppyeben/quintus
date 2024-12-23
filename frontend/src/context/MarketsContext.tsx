// src/context/MarketsContext.tsx
import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useMemo,
    ReactNode,
} from "react";
import { useReadContract } from "wagmi";
import { BET_ABI } from "@/utils/bet-abi";
import { Market, parseMarkets, RawMarketData } from "@/utils/markets";

// Define the shape of the context
interface MarketsContextType {
    markets: Market[];
    filteredMarkets: Market[];
    filteredMarketsByCategory: Market[];
    isLoading: boolean;
    error: Error | null;
    searchTerm: string;
    marketCategory?: bigint;
    setSearchTerm: (term: string) => void;
    setMarketCategory: (term: bigint) => void;
    refetchMarkets: () => void;
}

// Create the context
const MarketsContext = createContext<MarketsContextType | undefined>(undefined);

// Provider component
export const MarketsProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [allMarkets, setAllMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [marketCategory, setMarketCategory] = useState<bigint>();

    const {
        data: allMarketsData,
        refetch,
        isError,
        error: contractError,
    } = useReadContract({
        abi: BET_ABI,
        address: `0x${String(
            import.meta.env.VITE_PUBLIC_QUINTUS_MARKET as string
        ).substring(2)}`,
        functionName: "getAllMarkets",
    });

    useEffect(() => {
        if (allMarketsData) {
            try {
                const parsedMarkets = parseMarkets(
                    allMarketsData as unknown as RawMarketData
                );
                setAllMarkets(parsedMarkets);
                setIsLoading(false);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to parse markets")
                );
                setIsLoading(false);
            }
        }
    }, [allMarketsData]);

    useEffect(() => {
        if (isError) {
            setError(contractError);
            setIsLoading(false);
        }
    }, [isError, contractError]);

    // Memoized filtered markets
    const filteredMarkets = useMemo(() => {
        // If no search term, return all markets
        if (!searchTerm.trim()) return allMarkets;

        // Convert search term to lowercase for case-insensitive search
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        // Filter markets based on title or description
        return allMarkets.filter(
            (market) =>
                market.title.toLowerCase().includes(normalizedSearchTerm) ||
                market.description.toLowerCase().includes(normalizedSearchTerm)
        );
    }, [allMarkets, searchTerm]);

    // Filter markets by category
    const filteredMarketsByCategory = useMemo(() => {
        if (Number.isNaN(Number(marketCategory))) return allMarkets;

        return allMarkets.filter(
            (market) => Number(market.category) == Number(marketCategory)
        );
    }, [allMarkets, marketCategory]);

    // Provide the context value
    const value = {
        markets: allMarkets,
        filteredMarkets,
        filteredMarketsByCategory,
        isLoading,
        error,
        searchTerm,
        setSearchTerm,
        marketCategory,
        setMarketCategory,
        refetchMarkets: refetch,
    };

    return (
        <MarketsContext.Provider value={value}>
            {children}
        </MarketsContext.Provider>
    );
};

// Custom hook to use the Markets context
export const useMarkets = () => {
    const context = useContext(MarketsContext);
    if (context === undefined) {
        throw new Error("useMarkets must be used within a MarketsProvider");
    }
    return context;
};
