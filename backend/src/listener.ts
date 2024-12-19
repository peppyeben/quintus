import { ethers } from "ethers";
import { CONTRACT_ABI } from "./utils/abi";
require("dotenv").config();

const main = async () => {
    const provider = new ethers.JsonRpcProvider(
        process.env.BSC_RPC_URL as string
    );

    const contractAddress = process.env.CONTRACT_ADDRESS as string;

    const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        provider
    );

    console.log(`Listening for events from contract at: ${contractAddress}`);

    contract.on("TestEvent", (arg1: string, arg2: string, event: any) => {
        console.log(`Event received: ${arg1}, ${arg2}`);
        console.log("Full Event:", event);
    });
};

main().catch((error) => {
    console.error("Error:", error);
});
