import { ethers } from "ethers";
import { BET_ABI } from "./utils/abi";

import dotenv from "dotenv";
dotenv.config();

const main = async () => {
    const provider = new ethers.JsonRpcProvider(
        process.env.BSC_RPC_URL as string
    );

    const contractAddress = process.env.QUINTUS_MARKET as string;

    const contract = new ethers.Contract(contractAddress, BET_ABI, provider);

    console.log(`Listening for events from contract at: ${contractAddress}`);

    contract.on(
        "MarketReadyForResolution",
        (
            _marketId: bigint,
            betTitle: string,
            outcomes: string[],
            totalPool: bigint,
            creator: `0x${string}`,
            category: bigint
        ) => {
            console.log(`Market ID: ${_marketId}`);
            console.log(`Bet Title: ${betTitle}`);
            console.log(`Outcomes: ${outcomes}`);
            console.log(`Total Pool: ${totalPool}`);
            console.log(`Creator: ${creator}`);
            console.log(`Category: ${category}`);
        }
    );
};

main().catch((error) => {
    console.error("Error:", error);
});
