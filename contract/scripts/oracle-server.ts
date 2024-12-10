const { ethers } = require('ethers');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

// Configure provider and contracts
const provider = new ethers.providers.JsonRpcProvider(process.env.BNB_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, wallet);

// Configure OpenAI
const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// Listen for resolution requests
oracle.on('ResolutionRequested', async (wagerId, topic, condition, timestamp) => {
    try {
        // Fetch data from sources
        const [source1Data, source2Data] = await Promise.all([
            fetchDataSource1(topic),
            fetchDataSource2(topic)
        ]);
        
        // Use OpenAI to analyze data
        const result = await analyzeWithAI(
            condition,
            source1Data,
            source2Data
        );
        
        // Submit resolution
        await oracle.provideResolution(
            wagerId,
            result,
            JSON.stringify(source1Data),
            JSON.stringify(source2Data)
        );
        
        console.log(`Resolution provided for wager ${wagerId}`);
    } catch (error) {
        console.error(`Error processing wager ${wagerId}:`, error);
    }
});

async function analyzeWithAI(condition, source1Data, source2Data) {
    const prompt = `
        Given the following condition: "${condition}"
        And data from source 1: ${JSON.stringify(source1Data)}
        And data from source 2: ${JSON.stringify(source2Data)}
        Determine if the condition is met (true/false).
        Respond with only "true" or "false".
    `;
    
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 10,
        temperature: 0
    });
    
    return response.data.choices[0].text.trim().toLowerCase() === 'true';
}
