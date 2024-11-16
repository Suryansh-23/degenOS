import axios from "axios";
import dotenv from "dotenv";
import { createPublicClient, Hex, http } from "viem";
import { mainnet } from "viem/chains";

dotenv.config();
// const alchemyProvider = new ethers.JsonRpcProvider(
//     `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
// );
const alchemyProvider = http(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);
const publicClient = createPublicClient({
    chain: mainnet,
    transport: alchemyProvider,
});

// Fetch contract code
export const fetchContractCode = async (address: Hex) => {
    try {
        let code = await publicClient.getCode({ address });
        // console.log("Fetched code", code);
        return code;
    } catch (error) {
        console.error("Error fetching contract code:", error);
        return "0x";
    }
};

// Fetch contract history
export const fetchContractHistory = async (address: Hex) => {
    try {
        const response = await axios.get(
            `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`
        );
        return response.data.result;
    } catch (error) {
        console.error("Error fetching contract history:", error);
        return [];
    }
};

// Fetch memecoin details
export const fetchTokenDetails = async (address: Hex) => {
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`,
            {
                headers: {
                    accept: "application/json",
                    "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || "",
                },
            }
        );

        if (
            response.data &&
            response.data.market_data &&
            response.data.market_data.current_price
        ) {
            const { name, symbol, market_data } = response.data;
            return {
                name,
                symbol,
                price: market_data.current_price.usd
                    ? parseFloat(market_data.current_price.usd)
                    : 0,
                marketCap: market_data.market_cap.usd,
                volume: market_data.total_volume.usd,
            };
        } else {
            throw new Error("Invalid data structure returned from API");
        }
    } catch (error) {
        console.error("Error fetching memecoin details:", error);
        return {
            name: "Unknown",
            symbol: "UNKNOWN",
            price: 0.0,
            marketCap: 0,
            volume: 0,
        };
    }
};

// Fetch top holders
export const fetchTopHolders = async (address: Hex) => {
    try {
        const response = await axios.get(
            `https://api.ethplorer.io/getTopTokenHolders/${address}?apiKey=freekey&limit=3`
        );
        const holders = response.data.holders.map(
            (holder: { address: any; share: any }) => ({
                address: holder.address,
                percentage: holder.share,
            })
        );
        return holders;
    } catch (error) {
        console.error("Error fetching top holders:", error);
        return [];
    }
};

// Fetch contract creation block
export const fetchContractCreationBlock = async (address: Hex) => {
    try {
        const response = await axios.get(
            `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`
        );
        const creationTx = response.data.result[0];
        return creationTx ? creationTx.blockNumber : "Unknown";
    } catch (error) {
        console.error("Error fetching contract creation block:", error);
        return "Unknown";
    }
};
export const fetchNumberOfHolders = async (address: Hex) => {
    try {
        const response = await axios.get(
            `https://eth.blockscout.com/api/v2/tokens/${address}`
        );

        if (response.status !== 200) {
            throw new Error("Invalid response from API");
        } else {
            return response.data.holders;
        }
    } catch (error) {
        console.error("Error fetching number of holders:", error);
        return 0; // Return 0 in case of error
    }
};

export const calculateRiskScore = (
    transactions: string | any[],
    price: number,
    topHolders: any[],
    marketCap: number,
    volume: number
) => {
    let score = 0;
    const detailedScores = [];

    // Price Risk Score
    const priceFactor = Math.log(price + 1) * 50;
    const priceRisk = Math.min(50 / (priceFactor + 1), 50);
    detailedScores.push({
        label: "Price Risk",
        description: `Risk based on token price (${price}). Lower prices result in higher risk.`,
        score: priceRisk.toFixed(3),
    });
    score += priceRisk;

    // Market Cap Risk Score
    const marketCapFactor = Math.exp(-marketCap / 1000000) * 100;
    const marketCapRisk = marketCapFactor * 0.5;
    detailedScores.push({
        label: "Market Cap Risk",
        description: `Risk based on market cap (${marketCap}). Higher market cap reduces risk.`,
        score: marketCapRisk.toFixed(3),
    });
    score += marketCapRisk;

    // Volume Risk Score
    const volumeFactor = Math.sqrt(volume) / 100;
    const volumeRisk = volumeFactor * 0.3;
    detailedScores.push({
        label: "Volume Risk",
        description: `Risk based on trading volume (${volume}). Higher volume lowers risk.`,
        score: (-volumeRisk).toFixed(3),
    });
    score -= volumeRisk;

    // Top Holder Concentration Risk
    const topHolderTotalPercentage = topHolders.reduce(
        (total: any, holder: { percentage: any }) => total + holder.percentage,
        0
    );
    const concentrationRisk =
        (Math.pow(topHolderTotalPercentage, 2) / 100) * 0.8;
    detailedScores.push({
        label: "Top Holder Concentration Risk",
        description: `Risk based on concentration of top holders (${topHolderTotalPercentage}%). Higher concentration increases risk.`,
        score: concentrationRisk.toFixed(3),
    });
    score += concentrationRisk;

    // Transaction Risk Score
    const transactionFactor =
        1 / (1 + Math.exp(-0.1 * (transactions.length - 200)));
    const transactionRisk = transactionFactor * 30;
    detailedScores.push({
        label: "Transaction Risk",
        description: `Risk based on the number of transactions (${transactions.length}). Fewer transactions increase risk.`,
        score: transactionRisk.toFixed(3),
    });
    score += transactionRisk;

    // Contract Age Risk
    const currentTime = Date.now() / 1000;
    const creationTime =
        transactions.length > 0
            ? transactions[transactions.length - 1].timeStamp
            : currentTime;
    const contractAgeInDays = (currentTime - creationTime) / (60 * 60 * 24);
    const ageRisk = Math.exp(-contractAgeInDays / 365) * 20;
    detailedScores.push({
        label: "Contract Age Risk",
        description: `Risk based on contract age (${contractAgeInDays.toFixed(
            0
        )} days). Older contracts reduce risk.`,
        score: ageRisk.toFixed(3),
    });
    score += ageRisk;

    // Final adjustment and normalization
    const finalScore = Math.min(100, Math.max(0, parseFloat(score.toFixed(3))));
    detailedScores.push({
        label: "Final Risk Score",
        description: "Total risk score after aggregating all factors.",
        score: finalScore,
    });

    return { finalScore, detailedScores };
};

