"use client";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <DynamicContextProvider
                    settings={{
                        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
                        environmentId: "3fe70d93-65b0-4427-ae5f-ec21878bed95",
                        walletConnectors: [EthereumWalletConnectors],
                        // handlers: {
                        //     handleAuthenticatedUser: async (args) => {
                        //         console.log("Authenticated user", args);
                        //         router.push("/mid");
                        //     },
                        // },
                    }}>
                    {children}
                </DynamicContextProvider>
            </body>
        </html>
    );
}

