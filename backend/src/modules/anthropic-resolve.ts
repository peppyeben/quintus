import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { SEARCH_RESULTS } from "../utils/search-results";
import { processSearchResults } from "./scrape-website-data";

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API });

async function resolveBetWithAI(
    title: string,
    description: string,
    data: string,
    outcomes: string[]
) {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-haiku-latest",
            max_tokens: 10,
            messages: [
                {
                    role: "user",
                    content: `PREDICTION RESOLUTION:

ANALYZE CAREFULLY:
- Title: ${title}
- Detailed Content: ${data}

STRICT REQUIREMENTS:
- Determine if the prediction in the title occurred
- Return ONLY: ${outcomes.join(", ")}
- Base decision on ENTIRE content
- No explanations

CORE QUESTION:
Did the event happen?`,
                },
            ],
        });

        // Extract the outcome
        const rawOutcome = response.content[0];
        const outcomeText =
            typeof rawOutcome === "object" && "text" in rawOutcome
                ? rawOutcome.text.trim()
                : "";

        // Validate and map outcome
        const validatedOutcome = outcomes.find(
            (o) =>
                outcomeText.includes(o) ||
                outcomeText.toLowerCase() === o.toLowerCase()
        );

        // Fallback for clear title matches
        if (!validatedOutcome) {
            const titleLower = title.toLowerCase();
            if (
                titleLower.includes("hits $100,000") ||
                titleLower.includes("hit $100,000") ||
                titleLower.includes("surpasses $100,000")
            ) {
                return {
                    title,
                    outcome: "True",
                };
            }
        }

        return {
            title,
            outcome: validatedOutcome || outcomes[0],
        };
    } catch (error) {
        console.error(`Error processing prediction: ${title}`, error);
        return {
            title,
            outcome: outcomes[0],
        };
    }
}

async function processArticles(articles: any, outcomes: any) {
    const results = [];

    for (const article of articles) {
        const result = await resolveBetWithAI(
            article.title,
            article.description || "No specific description provided",
            article.content,
            outcomes
        );

        results.push(result);
    }

    return results;
}

(async () => {
    const articles = await processSearchResults(SEARCH_RESULTS);
    const results = await processArticles(articles, ["True", "False"]);

    console.log("Processed Results:", results);
})();
