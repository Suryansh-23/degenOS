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

const graphEndpoint =
    "https://gateway.thegraph.com/api/ba80fc238ce7e63f79fddc9ceb1ea8eb/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV";

export const analyzePool = async (poolId: string) => {
    console.log("Analyzing pool:", poolId);
    try {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 30 * 24 * 60 * 60; // 30 days ago
        const endTime1 = Math.floor(Date.now() / 1000);
        const startTime1 = endTime - 30 * 24 * 60 * 60; // 30 days ago

        const data = await request(graphEndpoint, QUERIES.getPoolAnalytics, {
            id: poolId.toLowerCase(),
            startTime,
            endTime,
            startTime1,
            endTime1,
        });

        console.log("data:", data);
        return data;
    } catch (error) {
        console.error("Error in analyzePool:", error);
        throw new Error(`Failed to analyze pool: ${error}`);
    }
};

