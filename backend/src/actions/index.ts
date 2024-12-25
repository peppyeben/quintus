import SportsDBService from "../modules/sports/find-sportsdb-result";
import QueryParser from "../modules/sports/parse-market-data";
import dotenv from "dotenv";
import QueryBridge from "../modules/sports/query-bridge";
import MarketResolver from "../modules/sports/market-resolver";
import { predictionQueries } from "../data/queries";
dotenv.config();

async function main(
    preMatchQuery: string,
    preMatchOutcomes: string[],
    preMatchDescription: string = ""
) {
    const myQueryParser = new QueryParser(
        process.env.ANTHROPIC_API_KEY as string
    );

    const parsedQueryResult = await myQueryParser
        .parseQuery(preMatchQuery, preMatchDescription)
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processQueries() {
    let queryRes = [];
    for (let i = 0; i < predictionQueries.length; i++) {
        const query = predictionQueries[i];
        const preMatchQuery = query.query;
        const preMatchOutcomes = query.outcomes;

        await delay(3000);
        const res = await main(preMatchQuery, preMatchOutcomes);
        queryRes.push({
            query: preMatchQuery,
            result: res,
        });
    }

    console.log(queryRes);
}

processQueries();
