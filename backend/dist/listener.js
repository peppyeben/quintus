"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const abi_1 = require("./utils/abi");
const dotenv_1 = __importDefault(require("dotenv"));
const actions_1 = require("./actions");
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config();
async function startApp() {
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
        const contractAddress = process.env.QUINTUS_MARKET;
        const quintusMarketContract = new ethers_1.ethers.Contract(contractAddress, abi_1.BET_ABI, provider);
        const quintusOracleContract = new ethers_1.ethers.Contract(contractAddress, abi_1.QUINTUS_ORACLES_ABI, provider);
        logger_1.default.info(`Listening for events from market contract at: ${contractAddress}`);
        quintusMarketContract.on("MarketReadyForResolution", async (_marketId, betTitle, outcomes, totalPool, creator, category) => {
            logger_1.default.info(`Market ID: ${_marketId}`);
            logger_1.default.info(`Bet Title: ${betTitle}`);
            logger_1.default.info(`Outcomes: ${outcomes}`);
            logger_1.default.info(`Processing queries and outcomes for market ${betTitle}`);
            try {
                const processedResult = await (0, actions_1.processQueriesAndOutcomes)(betTitle, outcomes);
                logger_1.default.info("Processed result:", processedResult);
                const oracleRes = await quintusOracleContract.resolveBet([
                    _marketId,
                    processedResult,
                ]);
                logger_1.default.info("Oracle response:", oracleRes);
            }
            catch (error) {
                logger_1.default.error("Error processing queries and outcomes:", error);
            }
        });
        // Keep the process running
        await new Promise(() => { });
    }
    catch (error) {
        logger_1.default.error("Critical error in application:", error);
        // Wait and restart
        logger_1.default.info("Restarting application in 5 seconds...");
        setTimeout(() => {
            logger_1.default.info("Restarting now...");
            startApp();
        }, 5000);
    }
}
// Initial start
startApp().catch((error) => {
    logger_1.default.error("Unhandled error:", error);
    process.exit(1);
});
