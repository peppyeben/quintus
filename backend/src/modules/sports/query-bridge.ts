import Anthropic from "@anthropic-ai/sdk";
import { QueryParseResult } from "./parse-market-data";

class QueryBridge {
    private anthropic: Anthropic;

    constructor(apiKey: string) {
        this.anthropic = new Anthropic({ apiKey });
    }

    async bridgeQueryToSearch(queryResult: QueryParseResult): Promise<{
        homeTeam: string;
        awayTeam: string;
        predictionType: string;
    }> {
        const prompt = `
      Given these teams: ${queryResult.teams.join(" and ")}
      Determine which team should be HOME team and which should be AWAY team.

      Considerations:
      - In soccer/football, home team is typically listed first in the original match schedule
      - Look at the order in the original query
      - Provide a clear, confident determination

      Respond ONLY with a JSON in this format:
      {
        "homeTeam": "Team Name",
        "awayTeam": "Team Name"
      }
    `;

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

            const teamOrder = JSON.parse(jsonMatch[0]);

            return {
                homeTeam: teamOrder.homeTeam,
                awayTeam: teamOrder.awayTeam,
                predictionType: queryResult.predictionType,
            };
        } catch (error) {
            console.error("Error in query bridge:", error);

            // Fallback logic if AI fails
            return {
                homeTeam: queryResult.teams[0],
                awayTeam: queryResult.teams[1],
                predictionType: queryResult.predictionType,
            };
        }
    }
}

export default QueryBridge;
