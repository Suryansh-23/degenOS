export const calculateRiskScore = (
    txnsLen: number,
    contractAgeInDays: number,
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
    const transactionFactor = 1 / (1 + Math.exp(-0.1 * (txnsLen - 200)));
    const transactionRisk = transactionFactor * 30;
    detailedScores.push({
        label: "Transaction Risk",
        description: `Risk based on the number of transactions (${txnsLen}). Fewer transactions increase risk.`,
        score: transactionRisk.toFixed(3),
    });
    score += transactionRisk;

    // Contract Age Risk
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

