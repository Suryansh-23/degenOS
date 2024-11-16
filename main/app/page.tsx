"use client";

import {
    DynamicWidget,
    useIsLoggedIn,
    useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig, WagmiProvider } from "wagmi";

const config = createConfig({
    chains: [sepolia],
    multiInjectedProviderDiscovery: false,
    transports: {
        [sepolia.id]: http(),
    },
});

const queryClient = new QueryClient();

export default function App() {
    const router = useRouter();
    const isLoggedIn = useIsLoggedIn();

    const WalletInfo = () => {
        const { primaryWallet, user, handleLogOut } = useDynamicContext();

        if (!primaryWallet) return null;

        return (
            <div className="space-y-6 p-8">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20">
                    <p className="text-sm text-gray-600 mb-2">
                        Connected Address:
                    </p>
                    <p className="font-mono text-gray-800 break-all">
                        {primaryWallet.address}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20">
                    <p className="text-sm text-gray-600 mb-2">Email:</p>
                    <p className="text-gray-800">
                        {user?.email || "Not provided"}
                    </p>
                </div>
                <button
                    onClick={handleLogOut}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transform transition-all duration-200 hover:-translate-y-0.5">
                    Disconnect
                </button>
            </div>
        );
    };

    useEffect(() => {
        if (isLoggedIn) {
            console.log("User is logged in");
            router.push("/mid");
        } else {
            console.log("User is not logged in");
        }
    }, [isLoggedIn, router]);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <DynamicWagmiConnector>
                    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5e6d3] to-[#d2e9d4] flex items-center justify-center p-4">
                        <div className="w-full max-w-xl mx-auto">
                            <div className="relative bg-white/40 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-20 border border-white/50">
                                <div className="w-full">
                                    <div className="text-center mb-12">
                                        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 inline-block text-transparent bg-clip-text font-serif tracking-wide">
                                            degenOS
                                        </h1>
                                        <p className="mt-4 text-gray-600">
                                            Connect your wallet to continue
                                        </p>
                                    </div>
                                    <div className="transform transition-all hover:scale-[1.01] duration-200 flex justify-center">
                                        <DynamicWidget />
                                    </div>
                                    <WalletInfo />
                                </div>
                            </div>
                        </div>
                    </div>
                </DynamicWagmiConnector>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

