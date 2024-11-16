"use client";

import { DynamicWidget, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
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

    useEffect(() => {
        if (isLoggedIn) {
            console.log("User is logged in");
            router.push("/mid");
        } else {
            console.log("User is not logged in");
        }
    }, [isLoggedIn]);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <DynamicWagmiConnector>
                    <main className="flex justify-center items-center min-h-screen">
                        <DynamicWidget />
                    </main>
                </DynamicWagmiConnector>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

