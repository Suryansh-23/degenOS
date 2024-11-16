import React, { useEffect, useRef } from "react";
import { createCowSwapWidget } from "@cowprotocol/widget-lib";

const CowSwapWidget = () => {
    const widgetRef = useRef(null);

    useEffect(() => {
        if (widgetRef.current) {
            const params = {
                appCode: "My Cool App",
                width: "100%",
                height: "640px",
                chainId: 1,
                tokenLists: [
                    "https://defi.cmc.eth.link",
                    "https://files.cow.fi/tokens/CoinGecko.json",
                    "https://files.cow.fi/tokens/CowSwap.json",
                    "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json",
                ],
                tradeType: "swap",
                sell: {
                    asset: "USDC",
                    amount: "100000",
                },
                buy: {
                    asset: "COW",
                    amount: "0",
                },
                enabledTradeTypes: ["swap", "limit", "advanced"],
                theme: {
                    baseTheme: "light",
                    paper: "#ffe6d8",
                },
                standaloneMode: true,
                disableToastMessages: false,
                disableProgressBar: false,
                hideBridgeInfo: false,
                hideOrdersTable: false,
                images: {},
                sounds: {},
                customTokens: [],
            };

            const provider = window.ethereum;
            const { updateParams } = createCowSwapWidget(widgetRef.current, {
                params,
                provider,
            });
        }
    }, []);

    return <div ref={widgetRef} style={{ width: "100%", height: "650px" }} />;
};

export default CowSwapWidget;
