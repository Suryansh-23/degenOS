import { Hex } from "viem";

const dappAddress = "0x2291ba684ea6bCA81caCE56fcc1194A84086C912" as Hex;
const inputBoxAddress = "0x59b22D57D4f067708AB0c00552767405926dc768" as Hex;
const dappRelayAddress = "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE" as Hex;
const chainID = BigInt("11155111");

const cartesiNodeUrl = "http://localhost:8080";
const inpsectUrl = `${cartesiNodeUrl}/inspect`;
const l2DevNonceUrl = `${cartesiNodeUrl}/nonce`;
const l2DevSendTransactionUrl = `${cartesiNodeUrl}/submit`;

export {
    cartesiNodeUrl,
    dappAddress,
    inputBoxAddress,
    dappRelayAddress,
    chainID,
    inpsectUrl,
    l2DevNonceUrl,
    l2DevSendTransactionUrl,
};

