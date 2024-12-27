import Anthropic from "@anthropic-ai/sdk";
import { QueryParseResult } from "./parse-market-data";
import { MatchDetails } from "./find-sportsdb-result";

export interface ResolutionResult {
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
                // model: "claude-3-5-sonnet-20241022",
                max_tokens: 1000,
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
        const teamA = matchResult.strHomeTeam;
        const teamB = matchResult.strAwayTeam;

        const teamAGoals = matchResult.intHomeScore;
        const teamBGoals = matchResult.intAwayScore;
        return `
    MATCH RESOLUTION PROTOCOL

TEAMS IN MATCH:
- ${teamA}
- ${teamB}

MATCH RESULT:
- ${teamA} Goals: ${teamAGoals}
- ${teamB} Goals: ${teamBGoals}

PREDICTION QUERY: ${queryResult.query}
POSSIBLE OUTCOMES: ${possibleOutcomes}

CORE RESOLUTION RULES:
1. WIN Condition: Team with MORE goals wins
2. LOSE Condition: Team with FEWER goals loses
3. DRAW Condition: Exactly EQUAL goals
4. CLEAN SHEET: Team concedes ZERO goals
5. BOTH TEAMS SCORE: Each team scores AT LEAST ONE goal

OVER/UNDER GOALS RESOLUTION:
- TOTAL GOALS = ${teamA} Goals + ${teamB} Goals
- CALCULATE BY SUMMING BOTH TEAM'S GOALS
- "Over X.5" means TOTAL GOALS STRICTLY GREATER than X
- "Under X.5" means TOTAL GOALS STRICTLY LESS than X

OVER/UNDER EXAMPLES:
- Total Match Goals: ${Number(teamAGoals) + Number(teamBGoals)}
- "Over 2.5" Condition:
  * If total goals > 2, outcome is YES
  * If total goals ≤ 2, outcome is NO
- "Under 4.5" Condition:
  * If total goals < 4, outcome is YES
  * If total goals ≥ 4, outcome is NO

INTERPRETATION GUIDELINES:
- Directly map query to match result
- Use ONLY numerical goal data
- PRECISE matching of query intent
- NO subjective interpretations

QUERY TYPE MAPPING:
- "Will [Team] win?" = Team's goals > Opponent's goals
- "Will [Team] lose?" = Team's goals < Opponent's goals
- "Draw?" = Equal goal counts
- "[Team] clean sheet?" = Team concedes ZERO goals
- "Both teams score?" = BOTH teams have 1+ goals
- "Over/Under X.5 goals?" = Total match goals compared to X.5 threshold

CRITICAL VERIFICATION STEPS:
1. Identify teams in query
2. Extract goal data
3. Apply resolution rules
4. Validate reasoning against original query

STRICT OUTPUT FORMAT:
{
  "outcome": "Exact matched outcome",
  "reasoning": "Precise numerical explanation DIRECTLY referencing team names and goals"
}

ABSOLUTE REQUIREMENTS:
- 100% NUMERICAL PRECISION
- EXPLICIT TEAM REFERENCES
- UNAMBIGUOUS REASONING
- NO COMPUTATIONAL GUESSWORK `;
    }
}

export default MarketResolver;
