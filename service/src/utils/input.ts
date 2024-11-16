import { Hex, PrivateKeyAccount, toHex } from "viem";
import {
    chainID,
    dappAddress,
    l2DevNonceUrl,
    l2DevSendTransactionUrl,
} from "./config";

const typedData = {
    domain: {
        name: "Cartesi",
        version: "0.1.0",
        chainId: chainID,
        verifyingContract: "0x0000000000000000000000000000000000000000",
    } as const,
    types: {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ],
        CartesiMessage: [
            { name: "app", type: "address" },
            { name: "nonce", type: "uint64" },
            { name: "max_gas_price", type: "uint128" },
            { name: "data", type: "bytes" },
        ],
    } as const,
    primaryType: "CartesiMessage" as const,
    message: {
        app: "0x" as `0x${string}`,
        nonce: BigInt(0),
        data: "0x" as `0x${string}`,
        max_gas_price: BigInt(10),
    },
};

export const preparePayload = (
    operation: "LOGIN" | "ANALYZE_RISK" | "ANALYZE_POOL" | "BATCH",
    msg: unknown
) => {
    return toHex(JSON.stringify({ operation, msg }));
};

export const chunkString = (
    str: string,
    chunkSize: number = 2048
): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        chunks.push(str.slice(i, i + chunkSize));
    }
    return chunks;
};

const fetchNonceL2 = async (user: unknown, application: unknown) => {
    const response = await fetch(l2DevNonceUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg_sender: user, app_contract: application }),
    });

    const responseData = await response.json();
    const nextNonce = responseData.nonce;
    return nextNonce;
};

const submitTransactionL2 = async (fullBody: unknown) => {
    const body = JSON.stringify(fullBody);
    const response = await fetch(l2DevSendTransactionUrl, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        console.log("submit to L2 failed");
        throw new Error("submit to L2 failed: " + (await response.text()));
    } else {
        console.log(response);
        return response.json();
    }
};

export const sendAvailInput = async (
    account: PrivateKeyAccount,
    address: Hex,
    payload: Hex
) => {
    if (!account) return;

    console.log("Sending input to L2...");
    const nonce = await fetchNonceL2(address, dappAddress);
    console.log("Nonce:", nonce);

    typedData.message = {
        app: dappAddress,
        nonce,
        data: payload,
        max_gas_price: BigInt(10),
    };

    try {
        console.log("Signing typed data...");
        const signature = await account.signTypedData({
            ...typedData,
        });
        console.log("Signature:", signature);

        const l2data = JSON.parse(
            JSON.stringify(
                {
                    typedData,
                    signature,
                },
                (_, value) =>
                    typeof value === "bigint"
                        ? parseInt(value.toString())
                        : value // return everything else unchanged
            )
        );

        const res = await submitTransactionL2(l2data);
        return res;
    } catch (e) {
        console.log(`${e}`);
    }
};

