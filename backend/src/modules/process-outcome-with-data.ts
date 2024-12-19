import GoogleSearchResolver from "./custom-search-resolve";
import { processSearchResults } from "./scrape-website-data";

async function processOutcomeWithData(
    title: string,
    desc: string,
    outcomes: string[]
) {
    const searchResults = await GoogleSearchResolver.searchQuery(title, {
        apiKey: process.env.GOOGLE_SEARCH_API_KEY || "",
        engineId: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || "",
        limit: 10,
    });

    console.log(searchResults);

    const processedResults = await processSearchResults(searchResults);

    return processedResults;
}

const title = "Bitcoin will hit 100k by January 2024";
const description =
    "Predict whether Bitcoin's price will reach $100,000 between December 15, 2023, and January 1, 2024.";
const data = "Bitcoin's price reached $100,000 on December 25, 2023.";
const outcomes = ["True", "False"];

processOutcomeWithData(title, description, outcomes)
    .then((res) => {
        console.log(res);
    })
    .catch((e) => {
        console.log(e);
    });
