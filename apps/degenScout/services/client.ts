import type { ChainType } from "@evmexplorer/utility";
import { http, createPublicClient } from "viem";
import { mainnet, base, optimism, arbitrum } from "viem/chains";

const clients = {
  mainnet: createPublicClient({ chain: mainnet, transport: http() }),
  optimism: createPublicClient({ chain: optimism, transport: http() }),
  base: createPublicClient({ chain: base, transport: http() }),
  arbitrum: createPublicClient({ chain: arbitrum, transport: http() }),
};

export function getPublicClient(chain: ChainType = "mainnet") {
  return clients[chain as ChainType];
}

export async function getBlock(bigIntBlock: bigint, chain: ChainType) {
  const client = getPublicClient(chain);
  return await client.getBlock({
    blockNumber: bigIntBlock,
    includeTransactions: true,
  });
}

export async function getTransaction(hash: `0x${string}`, chain: ChainType) {
  const client = getPublicClient(chain);
  return await client.getTransaction({
    hash: hash,
  });
}
