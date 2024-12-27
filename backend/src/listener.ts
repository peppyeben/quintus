import { ethers } from "ethers";
import { BET_ABI, QUINTUS_ORACLES_ABI } from "./utils/abi";
import dotenv from "dotenv";
import { processQueriesAndOutcomes } from "./actions";
import logger from "./logger";

dotenv.config();

async function startApp() {
    try {
        const provider = new ethers.JsonRpcProvider(
            process.env.BSC_RPC_URL as string
        );

        const contractAddress = process.env.QUINTUS_MARKET as string;

        const quintusMarketContract = new ethers.Contract(
            contractAddress,
            BET_ABI,
            provider
        );

        const quintusOracleContract = new ethers.Contract(
            contractAddress,
            QUINTUS_ORACLES_ABI,
            provider
        );

        logger.info(
            `Listening for events from market contract at: ${contractAddress}`
        );

        quintusMarketContract.on(
            "MarketReadyForResolution",
            async (
                _marketId: bigint,
                betTitle: string,
                outcomes: string[],
                totalPool: bigint,
                creator: `0x${string}`,
                category: bigint
            ) => {
                logger.info(`Market ID: ${_marketId}`);
                logger.info(`Bet Title: ${betTitle}`);
                logger.info(`Outcomes: ${outcomes}`);

                logger.info(
                    `Processing queries and outcomes for market ${betTitle}`
                );
                try {
                    const marketInfo =
                        await quintusMarketContract.getMarketInfo(_marketId);

                    console.log("Market Info:", marketInfo);

                    const processedResult = await processQueriesAndOutcomes(
                        betTitle,
                        outcomes,
                        marketInfo[2].toNumber(),
                        marketInfo[3].toNumber()
                    );

                    logger.info("Processed result:", processedResult);

                    const oracleRes = await quintusOracleContract.resolveBet([
                        _marketId,
                        processedResult,
                    ]);

                    logger.info("Oracle response:", oracleRes);
                } catch (error) {
                    logger.error(
                        "Error processing queries and outcomes:",
                        error
                    );
                }
            }
        );

        // Keep the process running
        await new Promise(() => {});
    } catch (error) {
        logger.error("Critical error in application:", error);

        // Wait and restart
        logger.info("Restarting application in 5 seconds...");
        setTimeout(() => {
            logger.info("Restarting now...");
            startApp();
        }, 5000);
    }
}

// Initial start
startApp().catch((error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
});
