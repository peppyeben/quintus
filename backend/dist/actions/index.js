"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processQueriesAndOutcomes = main;
const find_sportsdb_result_1 = __importDefault(require("../modules/sports/find-sportsdb-result"));
const parse_market_data_1 = __importDefault(require("../modules/sports/parse-market-data"));
const dotenv_1 = __importDefault(require("dotenv"));
const query_bridge_1 = __importDefault(require("../modules/sports/query-bridge"));
const market_resolver_1 = __importDefault(require("../modules/sports/market-resolver"));
const queries_1 = require("../data/queries");
dotenv_1.default.config();
async function main(preMatchQuery, preMatchOutcomes, preMatchDescription = "") {
    const myQueryParser = new parse_market_data_1.default(process.env.ANTHROPIC_API_KEY);
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
    const queryBridge = new query_bridge_1.default(process.env.ANTHROPIC_API_KEY);
    const searchParams = await queryBridge.bridgeQueryToSearch(parsedQueryResult);
    const mySportsDBResult = new find_sportsdb_result_1.default();
    const matchResult = await mySportsDBResult
        .findMatch(searchParams.homeTeam, searchParams.awayTeam, 1734798513, 1734798686)
        .catch((error) => {
        console.log("Error finding match:", error);
        return null;
    });
    if (!matchResult) {
        return {
            error: "Error finding match",
        };
    }
    const marketResolver = new market_resolver_1.default(process.env.ANTHROPIC_API_KEY);
    const resolvedMarket = await marketResolver.resolveMarket(matchResult, parsedQueryResult, preMatchOutcomes);
    return resolvedMarket;
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function processQueries() {
    let queryRes = [];
    for (let i = 0; i < queries_1.predictionQueries.length; i++) {
        const query = queries_1.predictionQueries[i];
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
