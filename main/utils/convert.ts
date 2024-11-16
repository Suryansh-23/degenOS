import { providers, Signer } from "ethers";
import { type PublicClient, type WalletClient } from "viem";

// Convert viem WalletClient to ethers Signer
export function walletClientToSigner(walletClient: WalletClient): Signer {
    // Create a provider that matches the EIP-1193 interface
    const provider = new providers.Web3Provider(walletClient.transport, {
        chainId: walletClient.chain?.id || 1,
        name: walletClient.chain?.name || "unknown",
        ensAddress: walletClient.chain?.contracts?.ensRegistry?.address,
    });

    return provider.getSigner(walletClient.account?.address);
}

// Convert viem PublicClient to ethers Provider
export function publicClientToProvider(publicClient: PublicClient) {
    return new providers.Web3Provider(publicClient.transport, {
        chainId: publicClient.chain?.id || 1,
        name: publicClient.chain?.name || "unknown",
        ensAddress: publicClient.chain?.contracts?.ensRegistry?.address,
    });
}

