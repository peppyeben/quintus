// src/hooks/useMarketSearch.ts
import { useState, useMemo } from "react";
import { Market } from "@/utils/markets";

export const useMarketSearch = (markets: Market[]) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Fuzzy search function
    const searchMarkets = useMemo(() => {
        // If no search term, return all markets
        if (!searchTerm.trim()) return markets;

        // Convert search term to lowercase for case-insensitive search
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        // Filter markets based on title or description
        return markets.filter(
            (market) =>
                market.title.toLowerCase().includes(normalizedSearchTerm) ||
                market.description.toLowerCase().includes(normalizedSearchTerm)
        );
    }, [markets, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        searchResults: searchMarkets,
    };
};
