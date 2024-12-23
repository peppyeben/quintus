import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function to extract team name and context using Claude
const extractQueryDetails = async (query: string) => {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-haiku-latest",
            max_tokens: 300,
            messages: [
                {
                    role: "user",
                    content: `Extract the key details from this sports betting query. Provide a precise JSON response with:
- team: the name of the team mentioned
- sport: the sport (if mentioned or inferable)
- context: additional context like match type, competition, etc.

Query: ${query}

IMPORTANT: Respond ONLY with a valid JSON object containing these keys.`,
                },
            ],
        });

        let responseText = "";
        for (const block of response.content) {
            if ("text" in block && typeof block.text === "string") {
                responseText = block.text;
                break;
            }
        }

        try {
            if (
                typeof responseText !== "string" &&
                typeof responseText === "object"
            ) {
                // This block is likely unnecessary, but kept for potential type checking
                return responseText;
            }

            // Validate JSON before parsing
            const isValidJSON = (str: string) => {
                try {
                    const result = JSON.parse(str);
                    return (
                        result &&
                        typeof result === "object" &&
                        !Array.isArray(result)
                    );
                } catch {
                    return false;
                }
            };

            if (isValidJSON(responseText)) {
                return JSON.parse(responseText);
            } else {
                throw new Error("Invalid JSON structure");
            }
        } catch (parseError) {
            console.error("Failed to parse JSON:", responseText);
            throw new Error("Could not parse Anthropic response as JSON");
        }
    } catch (error) {
        console.error("Error extracting query details:", error);
        throw new Error("Failed to parse query using Anthropic API");
    }
};

// Function to fetch the last match result of a team
const getLastMatchResult = async (teamName: string, sport?: string) => {
    try {
        // Step 1: Search for the team ID
        const searchTeamResponse = await axios.get(
            `${BASE_URL}/searchteams.php`,
            { params: { t: teamName } }
        );

        const team = searchTeamResponse.data.teams?.[0];
        if (!team) {
            throw new Error(`Team "${teamName}" not found.`);
        }

        const teamId = team.idTeam;

        // Step 2: Fetch the last event for the team
        const lastEventsResponse = await axios.get(
            `${BASE_URL}/eventslast.php`,
            { params: { id: teamId } }
        );

        console.log(lastEventsResponse.data)

        // const lastMatch = lastEventsResponse.data.results?.[0];
        // if (!lastMatch) {
        //     throw new Error(`No recent matches found for team "${teamName}".`);
        // }

        // // Extract match details
        // const { strHomeTeam, strAwayTeam, intHomeScore, intAwayScore } =
        //     lastMatch;
        // const isWin =
        //     (strHomeTeam === teamName && intHomeScore > intAwayScore) ||
        //     (strAwayTeam === teamName && intAwayScore > intHomeScore);
        // const isDraw = intHomeScore === intAwayScore;

        // return {
        //     match: `${strHomeTeam} vs ${strAwayTeam}`,
        //     score: `${intHomeScore}-${intAwayScore}`,
        //     isWin,
        //     isDraw,
        // };
    } catch (error: any) {
        console.error("Error fetching match result:", error.message);
        return null;
    }
};

// Function to resolve a sports bet
const resolveSportsBet = async (query: string) => {
    try {
        // Step 1: Use Anthropic to parse the query
        const queryDetails = await extractQueryDetails(query);

        if (!queryDetails.team) {
            throw new Error("Could not extract team name from query.");
        }

        // Step 2: Fetch last match result
        const result = await getLastMatchResult(
            queryDetails.team,
            queryDetails.sport
        );

        if (!result) {
            return {
                query,
                outcome: null,
                reason: "Could not fetch match result.",
            };
        }

        // Determine bet outcome based on different possible query interpretations
        let outcome: string | null = null;
        // if (query.toLowerCase().includes("win")) {
        //     outcome = result.isWin ? "True" : "False";
        // } else if (query.toLowerCase().includes("draw")) {
        //     outcome = result.isDraw ? "True" : "False";
        // }

        // return {
        //     query,
        //     team: queryDetails.team,
        //     sport: queryDetails.sport,
        //     outcome,
        //     details: `Match: ${result.match}, Score: ${result.score}`,
        // };
    } catch (error: any) {
        console.error("Error resolving sports bet:", error);
        return {
            query,
            outcome: null,
            reason: error.message,
        };
    }
};

// Example usage
(async () => {
    const queries = [
        "Did Manchester United win their last match?",
        "Did Liverpool draw their recent game?",
        "What was the result of the last Chelsea match?",
    ];

    for (const query of queries) {
        try {
            const result = await resolveSportsBet(query);
            console.log("Resolved Bet:", result);
        } catch (error) {
            console.error("Error processing query:", error);
        }
    }
})();

export { resolveSportsBet };
