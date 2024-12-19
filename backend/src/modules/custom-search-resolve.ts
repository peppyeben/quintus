import { google, customsearch_v1 } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

interface SearchOptions {
    limit?: number;
    apiKey: string;
    engineId: string;
}

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
}

const PRIORITY_DOMAINS = {
    news: ["apnews.com", "bbc.com/news", "theguardian.com"],
    sports: ["espn.com", "si.com", "bleacherreport.com"],
    politics: ["fivethirtyeight.com", "politico.com", "realclearpolitics.com"],
    finance: ["cnbc.com", "ft.com"],
    entertainment: ["variety.com", "hollywoodreporter.com", "ew.com"],
};

class GoogleSearchResolver {
    static async searchQuery(
        query: string,
        options: SearchOptions,
        priorityDomains: string[] = []
    ): Promise<SearchResult[]> {
        const { limit = 10, apiKey, engineId } = options;

        // Flatten the PRIORITY_DOMAINS and combine with additional domains
        const allPriorityDomains = [
            ...Object.values(PRIORITY_DOMAINS).flat(),
            ...priorityDomains,
        ];

        // Remove duplicates
        const uniquePriorityDomains = [...new Set(allPriorityDomains)];

        // If priority domains are provided, modify the query
        const modifiedQuery = uniquePriorityDomains.length
            ? `${query} (${uniquePriorityDomains
                  .map((domain) => `site:${domain}`)
                  .join(" OR ")})`
            : query;

        const customsearch = google.customsearch("v1");
        try {
            const response = await customsearch.cse.list({
                auth: apiKey,
                cx: engineId,
                q: modifiedQuery,
                num: limit,
            });

            return (response.data.items || []).map(
                (item): SearchResult => ({
                    title: item.title || "",
                    link: item.link || "",
                    snippet: item.snippet || "",
                    displayLink: item.displayLink || "",
                })
            );
        } catch (error) {
            console.error("Google Custom Search API Error:", error);
            throw error;
        }
    }
}

export default GoogleSearchResolver;

// Example usage
async function example() {
    try {
        const results = await GoogleSearchResolver.searchQuery(
            "Will Bitcoin hit 100k in 2024",
            {
                apiKey: process.env.GOOGLE_SEARCH_API_KEY || "",
                engineId: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || "",
                limit: 10,
            }
        );
        console.log(results);
    } catch (error) {
        console.error(error);
    }
}

example()
    .then((res) => {
        console.log(res);
    })
    .catch((e) => {
        console.log(e);
    });
