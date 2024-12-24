import Anthropic from "@anthropic-ai/sdk";

export interface QueryParseResult {
    teams: string[];
    predictionType: string;
    additionalDetails?: Record<string, any>;
}

class QueryParser {
    private anthropic: Anthropic;

    constructor(apiKey: string) {
        this.anthropic = new Anthropic({ apiKey });
    }

    async parseQuery(
        title: string,
        description?: string
    ): Promise<QueryParseResult> {
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
                .map((block) => (block as Anthropic.TextBlock).text)
                .join("\n");

            return this.parseResponse(responseText);
        } catch (error) {
            console.error("Error parsing query:", error);
            throw error;
        }
    }

    private constructPrompt(title: string, description?: string): string {
        let promptText = `
      Analyze the following market query and extract key details:

      Title: ${title}
      ${description ? `Description: ${description}` : ""}

      Respond ONLY with a valid JSON in this exact format:
      {
        "teams": ["Team1", "Team2"],
        "predictionType": "Match Winner / Total Goals / etc.",
        "additionalDetails": {}
      }

      IMPORTANT: 
      - Provide ONLY the JSON
      - No explanation or additional text
      - Ensure valid JSON syntax
    `;

        return promptText;
    }

    private parseResponse(responseText: string): QueryParseResult {
        try {
            // Extract JSON from response, removing any potential surrounding text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }

            const cleanedJson = jsonMatch[0].replace(/```(json)?/g, "").trim();
            return JSON.parse(cleanedJson);
        } catch (error) {
            console.error("Error parsing AI response:", responseText);
            throw new Error("Failed to parse AI response");
        }
    }
}

export default QueryParser;
