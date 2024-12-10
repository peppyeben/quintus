import Arweave from 'arweave';

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

async function storeMarketMetadata(
    marketAddress: string,
    description: string,
    outcomes: string[],
    deadline: number
) {
    const metadata = {
        marketAddress,
        description,
        outcomes,
        deadline,
        timestamp: Date.now()
    };

    const tx = await arweave.createTransaction({ data: JSON.stringify(metadata) });
    await arweave.transactions.sign(tx);
    await arweave.transactions.post(tx);
    
    return tx.id;
}
