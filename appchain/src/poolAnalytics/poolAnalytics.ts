const processData = (poolData: any) => {
    return {
        basic: processBasicMetrics(poolData),
        advanced: processAdvancedMetrics(poolData),
        trading: processTradingMetrics(poolData),
        historical: processHistoricalData(poolData),
    };
};

const processBasicMetrics = (poolData: {
    id: any;
    token0: { symbol: any };
    token1: { symbol: any };
    token0Price: string;
    totalValueLockedUSD: string;
    poolHourData: any;
    txCount: string;
    feeTier: string;
    liquidity: string;
}) => {
    return {
        address: poolData.id,
        token0Symbol: poolData.token0.symbol,
        token1Symbol: poolData.token1.symbol,
        currentPrice: parseFloat(poolData.token0Price),
        totalValueLockedUSD: parseFloat(poolData.totalValueLockedUSD),
        volume24h: calculate24HourVolume(poolData.poolHourData),
        txCount: parseInt(poolData.txCount),
        feeTier: parseInt(poolData.feeTier),
        liquidity: parseFloat(poolData.liquidity),
    };
};

const processAdvancedMetrics = (poolData: {
    poolHourData: any;
    totalValueLockedUSD: string;
}) => {
    const volumeToLiquidityRatio = calculateVLR(poolData);
    const liquidityUtilization = calculateLiquidityUtilization(poolData);
    const volatility = calculateVolatility(poolData.poolHourData);

    return {
        volumeToLiquidityRatio,
        liquidityUtilization,
        impermanentLossRisk: {
            riskScore: calculateILRisk(volatility, liquidityUtilization.rate),
            volatility,
            concentration: liquidityUtilization.rate,
        },
    };
};

const processTradingMetrics = (poolData: { swaps: never[] }) => {
    const recentSwaps = poolData.swaps;
    const tradeEfficiency = calculateTradeEfficiency(recentSwaps);

    return {
        recentTradesEfficiency: tradeEfficiency,
        swapCount24h: calculate24HourSwaps(recentSwaps as any[]),
    };
};

const processHistoricalData = (poolData: {
    poolHourData: any;
    poolDayData: any;
}) => {
    return {
        hourlyMetrics: (poolData.poolHourData || []).map(
            (hour: {
                periodStartUnix: string;
                volumeUSD: string;
                token0Price: string;
                token1Price: string;
                tvlUSD: string;
                txCount: string;
                open: string;
                high: string;
                low: string;
                close: string;
            }) => ({
                timestamp: parseInt(hour.periodStartUnix),
                volumeUSD: parseFloat(hour.volumeUSD),
                priceToken0: parseFloat(hour.token0Price),
                priceToken1: parseFloat(hour.token1Price),
                tvlUSD: parseFloat(hour.tvlUSD),
                transactions: parseInt(hour.txCount),
                open: parseFloat(hour.open),
                high: parseFloat(hour.high),
                low: parseFloat(hour.low),
                close: parseFloat(hour.close),
            })
        ),
        dailyMetrics: (poolData.poolDayData || []).map(
            (day: {
                date: string;
                volumeUSD: string;
                token0Price: string;
                token1Price: string;
                tvlUSD: string;
                txCount: string;
                open: string;
                high: string;
                low: string;
                close: string;
            }) => ({
                timestamp: parseInt(day.date),
                volumeUSD: parseFloat(day.volumeUSD),
                priceToken0: parseFloat(day.token0Price),
                priceToken1: parseFloat(day.token1Price),
                tvlUSD: parseFloat(day.tvlUSD),
                transactions: parseInt(day.txCount),
                open: parseFloat(day.open),
                high: parseFloat(day.high),
                low: parseFloat(day.low),
                close: parseFloat(day.close),
            })
        ),
    };
};

const calculate24HourVolume = (hourlyData: any[]) => {
    if (!hourlyData || hourlyData.length === 0) return 0;
    const last24Hours = hourlyData.slice(-24);
    return last24Hours.reduce(
        (sum: number, hour: { volumeUSD: string }) =>
            sum + parseFloat(hour.volumeUSD),
        0
    );
};

const calculateVLR = (poolData: {
    poolHourData: any;
    totalValueLockedUSD: string;
}) => {
    const volume24h = calculate24HourVolume(poolData.poolHourData);
    const currentLiquidity = parseFloat(poolData.totalValueLockedUSD);
    return currentLiquidity > 0 ? volume24h / currentLiquidity : 0;
};

const calculateLiquidityUtilization = (poolData: {
    poolHourData: any;
    totalValueLockedUSD: string;
}) => {
    const volume24h = calculate24HourVolume(poolData.poolHourData);
    const currentLiquidity = parseFloat(poolData.totalValueLockedUSD);
    const rate =
        currentLiquidity > 0 ? (volume24h / currentLiquidity) * 100 : 0;

    return {
        rate,
        status:
            rate < 1
                ? "Low"
                : rate < 5
                ? "Moderate"
                : rate < 10
                ? "High"
                : "Very High",
    };
};

const calculateVolatility = (hourlyData: string | any[]) => {
    if (!hourlyData || hourlyData.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < hourlyData.length; i++) {
        const currentPrice = parseFloat(hourlyData[i].close);
        const previousPrice = parseFloat(hourlyData[i - 1].close);
        if (previousPrice > 0) {
            returns.push((currentPrice - previousPrice) / previousPrice);
        }
    }

    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
        returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
        returns.length;
    return Math.sqrt(variance);
};

const calculateILRisk = (volatility: number, utilizationRate: number) => {
    const normalizedVolatility = Math.min(volatility * 100, 100);
    const normalizedUtilization = Math.min(utilizationRate, 100);
    return (normalizedVolatility * (100 - normalizedUtilization)) / 100;
};

const calculateTradeEfficiency = (swaps: any[]) => {
    if (!swaps || swaps.length === 0) {
        return { efficiency: "Unknown", gasUsedPerDollar: 0 };
    }

    const totalGasUsed = swaps.reduce(
        (
            sum: number,
            swap: { transaction: { gasUsed: string; gasPrice: string } }
        ) => {
            return (
                sum +
                parseInt(swap.transaction.gasUsed) *
                    parseInt(swap.transaction.gasPrice)
            );
        },
        0
    );

    const totalValueTraded = swaps.reduce(
        (sum: number, swap: { amountUSD: string }) =>
            sum + parseFloat(swap.amountUSD),
        0
    );

    const gasUsedPerDollar =
        totalValueTraded > 0 ? totalGasUsed / totalValueTraded : 0;

    return {
        efficiency:
            gasUsedPerDollar < 0.001
                ? "Excellent"
                : gasUsedPerDollar < 0.005
                ? "Good"
                : gasUsedPerDollar < 0.01
                ? "Fair"
                : "Poor",
        gasUsedPerDollar,
    };
};

const calculate24HourSwaps = (swaps: any[]) => {
    if (!swaps || swaps.length === 0) return 0;
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    return swaps.filter(
        (swap: { timestamp: string }) => parseInt(swap.timestamp) >= oneDayAgo
    ).length;
};

