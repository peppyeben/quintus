import axios from "axios";
import dotenv from "dotenv";
import { SEARCH_RESULTS } from "../utils/search-results";

dotenv.config();

// Add a delay function to prevent overwhelming the API
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function aiWebScraper(
    urls: string[],
    startIndex: number = 0,
    limit?: number
) {
    // Determine how many URLs to scrape
    const urlsToScrape = limit
        ? urls.slice(startIndex, startIndex + limit)
        : urls.slice(startIndex);

    const scrapedResults: any[] = [];

    for (const [index, url] of urlsToScrape.entries()) {
        try {
            const options = {
                method: "GET",
                url: "https://scrapers-proxy2.p.rapidapi.com/parser",
                params: {
                    url: url,
                    auto_detect: "true",
                },
                headers: {
                    "x-rapidapi-key": process.env.RAPID_API,
                    "x-rapidapi-host": "scrapers-proxy2.p.rapidapi.com",
                },
            };

            console.log(
                `Scraping URL ${index + 1}/${urlsToScrape.length}: ${url}`
            );

            const response = await axios.request(options);

            scrapedResults.push({
                url: url,
                title: response.data.title,
                content: response.data.content,
            });

            // Wait 2 seconds between requests to avoid rate limiting
            await delay(100000);
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);

            scrapedResults.push({
                url: url,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            await delay(100000);
        }
    }

    return scrapedResults;
}

// Example usage
async function main() {
    const urls = SEARCH_RESULTS.map((result) => result.link);

    // Or scrape a specific number of URLs
    const partialResults = await aiWebScraper(urls, 0, 5); // Start from 0, scrape first 5 URLs

    console.log(partialResults);
}

main().catch(console.error);
