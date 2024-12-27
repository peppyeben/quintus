"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class QueryBridge {
    constructor(apiKey) {
        this.anthropic = new sdk_1.default({ apiKey });
    }
    async bridgeQueryToSearch(queryResult) {
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
                .map((block) => block.text)
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
        }
        catch (error) {
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
exports.default = QueryBridge;
