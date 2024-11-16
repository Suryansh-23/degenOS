"use client";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { FC, useEffect } from "react";

declare global {
    interface Window {
        primaryWallet: unknown;
        user: unknown;
        handleLogOut: unknown;
    }
}

const Test: FC = () => {
    const { primaryWallet, user, handleLogOut } = useDynamicContext();

    // // useEffect(() => {
    // //     const iframe = document.querySelector("iframe");
    // //     if (iframe?.contentWindow) {
    // //         iframe.contentWindow.postMessage(
    // //             {
    // //                 type: "AUTH_DATA",
    // //                 data: {
    // //                     primaryWallet,
    // //                     user,
    // //                     handleLogOut,
    // //                 },
    // //             },
    // //             "http://localhost:8000"
    // //         );
    // //     }
    // // }, [handleLogOut, primaryWallet, user]);

    useEffect(() => {
        console.log("rendered");
    });

    return (
        <>
            <DynamicWidget />
            <iframe
                className="h-screen w-full"
                src="http://localhost:8000"
                // onLoad={(e) => {
                //     e.currentTarget.contentWindow?.postMessage(
                //         {
                //             type: "AUTH_DATA",
                //             data: {
                //                 primaryWallet,
                //                 user,
                //                 handleLogOut,
                //             },
                //         },
                //         "http://localhost:8000"
                //     );
                // }}
            />
        </>
    );
};

export default Test;

