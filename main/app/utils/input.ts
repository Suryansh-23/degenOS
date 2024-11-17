import { Hex, WalletClient } from "viem";
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
        throw new Error("submit to L2 failed: " + response.text());
    } else {
        return response.json();
    }
};

export const sendAvailInput = async (
    walletClient: WalletClient,
    payload: Hex
) => {
    if (!walletClient) return;
    const [account] = await walletClient.requestAddresses();
    if (!account) {
        return;
    }

    const nonce = await fetchNonceL2(account, dappAddress);
    typedData.message = {
        app: dappAddress,
        nonce,
        data: payload,
        max_gas_price: BigInt(10),
    };
    try {
        const signature = await walletClient.signTypedData({
            account,
            ...typedData,
        });
        const l2data = JSON.parse(
            JSON.stringify(
                {
                    typedData,
                    account,
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

