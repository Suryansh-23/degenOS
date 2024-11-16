import { request } from "graphql-request";

// Modified GraphQL Query according to schema
const QUERIES = {
    getPoolAnalytics: `
    query getPoolAnalytics($id: ID!, $startTime: Int!, $endTime: Int!, $startTime1: BigInt!, $endTime1: BigInt!) {
      pool(id: $id) {
        id
        token0 {
          id
          symbol
          decimals
        }
        token1 {
          id
          symbol
          decimals
        }
        totalValueLockedToken0
        totalValueLockedToken1
        totalValueLockedUSD
        token0Price
        token1Price
        volumeUSD
        untrackedVolumeUSD
        txCount
        feeTier
        liquidity
        
        poolHourData(
          where: {
            periodStartUnix_gte: $startTime
            periodStartUnix_lte: $endTime
          }
          orderBy: periodStartUnix
          orderDirection: asc
          first: 168  # Last 7 days of hourly data
        ) {
          periodStartUnix
          liquidity
          tvlUSD
          volumeToken0
          volumeToken1
          volumeUSD
          txCount
          token0Price
          token1Price
          open
          high
          low
          close
        }
        
        poolDayData(
          where: {
            date_gte: $startTime
            date_lte: $endTime
          }
          orderBy: date
          orderDirection: asc
          first: 30  # Last 30 days of daily data
        ) {
          date
          volumeToken0
          volumeToken1
          volumeUSD
          txCount
          tvlUSD
          token0Price
          token1Price
          open
          high
          low
          close
        }
        
        swaps(
          first: 100
          orderBy: timestamp
          orderDirection: desc
          where: {
            timestamp_gte: $startTime1
            timestamp_lte: $endTime1
          }
        ) {
          id
          timestamp
          amount0
          amount1
          amountUSD
          sender
          recipient
          transaction {
            id
            gasUsed
            gasPrice
          }
        }
      }
    }
  `,
};

class UniswapAnalytics {
    constructor() {
        this.graphEndpoint =
            "https://gateway.thegraph.com/api/ba80fc238ce7e63f79fddc9ceb1ea8eb/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV";
    }

    async analyzePool(poolId) {
        console.log("Analyzing pool:", poolId);
        try {
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - 30 * 24 * 60 * 60; // 30 days ago
            const endTime1 = Math.floor(Date.now() / 1000);
            const startTime1 = endTime - 30 * 24 * 60 * 60; // 30 days ago

            const data = await request(
                this.graphEndpoint,
                QUERIES.getPoolAnalytics,
                {
                    id: poolId.toLowerCase(),
                    startTime,
                    endTime,
                    startTime1,
                    endTime1,
                }
            );

            if (!data.pool) {
                throw new Error("Pool not found");
            }

            return this._processData(data.pool);
        } catch (error) {
            console.error("Error in analyzePool:", error);
            throw new Error(`Failed to analyze pool: ${error.message}`);
        }
    }

    _processData(poolData) {
        return {
            basic: this._processBasicMetrics(poolData),
            advanced: this._processAdvancedMetrics(poolData),
            trading: this._processTradingMetrics(poolData),
            historical: this._processHistoricalData(poolData),
        };
    }

    _processBasicMetrics(poolData) {
        return {
            address: poolData.id,
            token0Symbol: poolData.token0.symbol,
            token1Symbol: poolData.token1.symbol,
            currentPrice: parseFloat(poolData.token0Price),
            totalValueLockedUSD: parseFloat(poolData.totalValueLockedUSD),
            volume24h: this._calculate24HourVolume(poolData.poolHourData),
            txCount: parseInt(poolData.txCount),
            feeTier: parseInt(poolData.feeTier),
            liquidity: parseFloat(poolData.liquidity),
        };
    }

    _processAdvancedMetrics(poolData) {
        const volumeToLiquidityRatio = this._calculateVLR(poolData);
        const liquidityUtilization =
            this._calculateLiquidityUtilization(poolData);
        const volatility = this._calculateVolatility(poolData.poolHourData);

        return {
            volumeToLiquidityRatio,
            liquidityUtilization,
            impermanentLossRisk: {
                riskScore: this._calculateILRisk(
                    volatility,
                    liquidityUtilization.rate
                ),
                volatility,
                concentration: liquidityUtilization.rate,
            },
        };
    }

    _processTradingMetrics(poolData) {
        const recentSwaps = poolData.swaps || [];
        const tradeEfficiency = this._calculateTradeEfficiency(recentSwaps);

        return {
            recentTradesEfficiency: tradeEfficiency,
            swapCount24h: this._calculate24HourSwaps(recentSwaps),
        };
    }

    _processHistoricalData(poolData) {
        return {
            hourlyMetrics: (poolData.poolHourData || []).map((hour) => ({
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
            })),
            dailyMetrics: (poolData.poolDayData || []).map((day) => ({
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
            })),
        };
    }

    _calculate24HourVolume(hourlyData) {
        if (!hourlyData || hourlyData.length === 0) return 0;
        const last24Hours = hourlyData.slice(-24);
        return last24Hours.reduce(
            (sum, hour) => sum + parseFloat(hour.volumeUSD),
            0
        );
    }

    _calculateVLR(poolData) {
        const volume24h = this._calculate24HourVolume(poolData.poolHourData);
        const currentLiquidity = parseFloat(poolData.totalValueLockedUSD);
        return currentLiquidity > 0 ? volume24h / currentLiquidity : 0;
    }

    _calculateLiquidityUtilization(poolData) {
        const volume24h = this._calculate24HourVolume(poolData.poolHourData);
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
    }

    _calculateVolatility(hourlyData) {
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
            returns.reduce(
                (sum, ret) => sum + Math.pow(ret - avgReturn, 2),
                0
            ) / returns.length;
        return Math.sqrt(variance);
    }

    _calculateILRisk(volatility, utilizationRate) {
        const normalizedVolatility = Math.min(volatility * 100, 100);
        const normalizedUtilization = Math.min(utilizationRate, 100);
        return (normalizedVolatility * (100 - normalizedUtilization)) / 100;
    }

    _calculateTradeEfficiency(swaps) {
        if (!swaps || swaps.length === 0) {
            return { efficiency: "Unknown", gasUsedPerDollar: 0 };
        }

        const totalGasUsed = swaps.reduce((sum, swap) => {
            return (
                sum +
                parseInt(swap.transaction.gasUsed) *
                    parseInt(swap.transaction.gasPrice)
            );
        }, 0);

        const totalValueTraded = swaps.reduce(
            (sum, swap) => sum + parseFloat(swap.amountUSD),
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
    }

    _calculate24HourSwaps(swaps) {
        if (!swaps || swaps.length === 0) return 0;
        const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
        return swaps.filter((swap) => parseInt(swap.timestamp) >= oneDayAgo)
            .length;
    }
}

export default UniswapAnalytics;
