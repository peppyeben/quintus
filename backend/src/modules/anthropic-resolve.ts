import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { SEARCH_RESULTS } from "../utils/search-results";
import { processSearchResults } from "./scrape-website-data";

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API });

async function resolveBetWithAI(
    title: string,
    data: string,
    outcomes: string[]
) {
    try {
        const prompt = `
        You are an AI assistant designed to analyze blog posts, queries, and outcomes. 
        Based on the provided blog post and query, select the most suitable outcome from the list. 
        If no conclusion can be drawn, return "null". Provide only the outcome as the response.

        Blog Post: "${data}"
        Query: "${title}"
        Outcomes: ${outcomes.join(", ")}
        `;

        const response = await anthropic.messages.create({
            model: "claude-3-5-haiku-latest",
            max_tokens: 50,
            messages: [{ role: "user", content: prompt }],
        });

        const rawOutcome = response.content[0];
        const outcomeText =
            typeof rawOutcome === "object" && "text" in rawOutcome
                ? rawOutcome.text.trim()
                : "";

        const validatedOutcome = outcomes.find(
            (o) => o.toLowerCase() === outcomeText.toLowerCase()
        );

        return {
            title,
            outcome: validatedOutcome || "null",
        };
    } catch (error) {
        console.error(`Error processing prediction: ${title}`, error);
        return {
            title,
            outcome: "Error",
        };
    }
}

async function processArticles(
    articles: { title: string; description?: string }[],
    outcomes: string[]
) {
    const results = [];

    for (const article of articles) {
        try {
            const result = await resolveBetWithAI(
                article.title,
                article.description || "No description available",
                outcomes
            );
            results.push(result);
        } catch (error) {
            console.error(`Error processing article: ${article.title}`, error);
            results.push({ title: article.title, outcome: "Error" });
        }
    }

    return results;
}

(async () => {
    const articles = await processSearchResults(SEARCH_RESULTS);
    const results = await processArticles(articles, ["True", "False"]);
    console.log("Processed Results:", results);
})();
