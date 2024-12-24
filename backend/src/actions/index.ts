import SportsDBService from "../modules/sports/find-sportsdb-result";
import QueryParser from "../modules/sports/parse-market-data";
import dotenv from "dotenv";
import QueryBridge from "../modules/sports/query-bridge";
import MarketResolver from "../modules/sports/market-resolver";
dotenv.config();

const preMatchQuery =
    "How many goals will be scored in Arsenal vs Crystal Palace";
const preMatchOutcomes = ["Under 2.5", "Over 2.5"];

async function main() {
    const myQueryParser = new QueryParser(
        process.env.ANTHROPIC_API_KEY as string
    );

    const parsedQueryResult = await myQueryParser
        .parseQuery(preMatchQuery)
        .catch((error) => {
            console.log("Error parsing query:", error);
            return null;
        });

    if (!parsedQueryResult) {
        return {
            error: "Error parsing query",
        };
    }

    const queryBridge = new QueryBridge(
        process.env.ANTHROPIC_API_KEY as string
    );

    const searchParams = await queryBridge.bridgeQueryToSearch(
        parsedQueryResult
    );

    const mySportsDBResult = new SportsDBService();

    const matchResult = await mySportsDBResult
        .findMatch(
            searchParams.homeTeam,
            searchParams.awayTeam,
            1734798513,
            1734798686
        )
        .catch((error) => {
            console.log("Error finding match:", error);
            return null;
        });

    if (!matchResult) {
        return {
            error: "Error finding match",
        };
    }

    const marketResolver = new MarketResolver(
        process.env.ANTHROPIC_API_KEY as string
    );

    const resolvedMarket = await marketResolver.resolveMarket(
        matchResult,
        parsedQueryResult,
        preMatchOutcomes
    );

    return resolvedMarket;
}

main()
    .then((res) => {
        console.log(res);
    })
    .catch(console.error);
