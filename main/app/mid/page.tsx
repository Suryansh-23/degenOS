"use client";
// import { LoginInput } from "@/types/types";
// import { sendAvailInput } from "@/utils/input";
// import { isEthereumWallet } from "@dynamic-labs/ethereum";
// import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { FC, Suspense } from "react";
// import { Hex, toHex } from "viem";
import SplineScene from "./SplineScene";

const Mid: FC = () => {
    // const { primaryWallet } = useDynamicContext();

    // useEffect(() => {
    //     const sendMsg = async () => {
    //         if (!primaryWallet || !isEthereumWallet(primaryWallet)) return null;
    //         const walletClient = await primaryWallet.getWalletClient();

    //         const data: string = JSON.stringify({
    //             operation: "LOGIN",
    //             address: primaryWallet.address as Hex,
    //         } as LoginInput);

    //         const payload = toHex(data);

    //         const res = await sendAvailInput(walletClient, payload);
    //         console.log("Res: ", res);
    //     };

    //     console.log("Sending message");
    //     sendMsg();
    // }, [primaryWallet]);

    return (
        <main className="flex flex-col items-center justify-between h-screen bg-[#cecece]">
            <main className="absolute ml-0 mt-0 h-screen w-screen overflow-hidden">
                <Suspense
                    fallback={
                        <div className="mx-auto my-auto text-black">
                            Loading
                        </div>
                    }>
                    <SplineScene />
                </Suspense>
            </main>
        </main>
    );
};

export default Mid;

