import Anthropic from "@anthropic-ai/sdk";
import { QueryParseResult } from "./parse-market-data";
import { MatchDetails } from "./find-sportsdb-result";

interface ResolutionResult {
    outcome: string;
    reasoning: string;
}

class MarketResolver {
    private anthropic: Anthropic;

    constructor(apiKey: string) {
        this.anthropic = new Anthropic({ apiKey });
    }

    async resolveMarket(
        matchResult: MatchDetails,
        queryResult: QueryParseResult,
        possibleOutcomes: string[]
    ): Promise<ResolutionResult> {
        const prompt = this.constructPrompt(
            matchResult,
            queryResult,
            possibleOutcomes
        );

        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-haiku-latest",
                max_tokens: 300,
                messages: [{ role: "user", content: prompt }],
            });

            const responseText = response.content
                .filter((block) => block.type === "text")
                .map((block) => (block as Anthropic.TextBlock).text)
                .join("\n");

            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error("Error resolving market:", error);
            throw error;
        }
    }

    private constructPrompt(
        matchResult: MatchDetails,
        queryResult: QueryParseResult,
        possibleOutcomes: string[]
    ): string {
        const totalGoals =
            parseInt(matchResult.intHomeScore) +
            parseInt(matchResult.intAwayScore);

        return `
      Match Details:
      - Home Team: ${matchResult.strHomeTeam}
      - Away Team: ${matchResult.strAwayTeam}
      - Home Score: ${matchResult.intHomeScore}
      - Away Score: ${matchResult.intAwayScore}
      - Total Goals: ${totalGoals}

      Original Query: ${queryResult.predictionType}
      Possible Outcomes: ${possibleOutcomes.join(", ")}

      Carefully analyze the match result and determine the EXACT outcome that matches the original prediction query.

      Respond ONLY with a JSON in this format:
      {
        "outcome": "Specific outcome from the list",
        "reasoning": "Explanation of how this outcome was determined"
      }

      IMPORTANT:
      - Provide ONLY the JSON
      - No explanation or additional text
      - Ensure valid JSON syntax
      - Match the outcome exactly to one in the possible outcomes list
    `;
    }
}

export default MarketResolver;
