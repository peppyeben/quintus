"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class QueryParser {
    constructor(apiKey) {
        this.anthropic = new sdk_1.default({ apiKey });
    }
    async parseQuery(title, description) {
        const prompt = this.constructPrompt(title, description);
        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-haiku-latest",
                max_tokens: 300,
                messages: [{ role: "user", content: prompt }],
            });
            // Correctly handle the response content
            const responseText = response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text)
                .join("\n");
            return this.parseResponse(responseText);
        }
        catch (error) {
            console.error("Error parsing query:", error);
            throw error;
        }
    }
    constructPrompt(title, description) {
        let promptText = `
      Analyze the following market query and extract key details:

      Title: ${title}
      ${description ? `Description: ${description}` : ""}

      Respond ONLY with a valid JSON in this exact format:
      {
        "query": "Original query text",
        "teams": ["Team1", "Team2"],
        "predictionType": "Match Winner / Total Goals / etc.",
        "additionalDetails": {}
      }

      IMPORTANT: 
      - Provide ONLY the JSON
      - No explanation or additional text
      - Ensure valid JSON syntax
      - "query" should be EXACTLY the input title/query
    `;
        return promptText;
    }
    parseResponse(responseText) {
        try {
            // Extract JSON from response, removing any potential surrounding text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }
            const cleanedJson = jsonMatch[0].replace(/```(json)?/g, "").trim();
            const parsedResult = JSON.parse(cleanedJson);
            // Ensure query is present
            if (!parsedResult.query) {
                throw new Error("Query is missing from parsed result");
            }
            return parsedResult;
        }
        catch (error) {
            console.error("Error parsing AI response:", responseText);
            throw new Error("Failed to parse AI response");
        }
    }
}
exports.default = QueryParser;
