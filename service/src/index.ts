import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
    fetchContractCreationBlock,
    fetchContractHistory,
    fetchNumberOfHolders,
    fetchTokenDetails,
    fetchTopHolders,
} from "./tokenFetcher";
import { analyzePool } from "./uniswapAnalytics";
import { preparePayload, sendAvailInput } from "./utils/input";

dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 4200;

const privateKey = process.env.PRIVATE_KEY as Hex;
if (!privateKey) {
    throw new Error("PRIVATE_KEY is not defined in the environment variables");
}

const account = privateKeyToAccount(privateKey);
console.log("Address:", account.address);
// const walletClient = createWalletClient({
//     chain: sepolia,
//     transport: http(),
// });

app.get("/analyze_token", async (req: Request, res: Response) => {
    const address = req.query.address as Hex;
    console.log("Analyzing meme for address:", address, "...");

    console.log("-----------------------------------");
    console.log("CONTRACT CODE");
    // console.log(await fetchContractCode(address));
    console.log("-----------------------------------");
    console.log("CONTRACT HISTORY");
    const txns = await fetchContractHistory(address);
    const txnsLen = txns.length;

    const currentTime = Date.now() / 1000;
    const creationTime =
        txnsLen > 0 ? txns[txnsLen - 1].timeStamp : currentTime;
    const contractAgeInDays = (currentTime - creationTime) / (60 * 60 * 24);
    console.log("Contract age in days:", contractAgeInDays);
    // console.log(txns);
    console.log("-----------------------------------");
    console.log("TOKEN DETAILS");
    const dets = await fetchTokenDetails(address);
    console.log(dets);
    console.log("-----------------------------------");
    console.log("TOP HOLDERS");
    const topHolders = await fetchTopHolders(address);
    console.log(topHolders);
    console.log("-----------------------------------");
    console.log("CONTRACT CREATION BLOCK");
    const creationBlock = await fetchContractCreationBlock(address);
    console.log(creationBlock);
    console.log("-----------------------------------");
    console.log("NUMBER OF HOLDERS");
    const numOfHolders = await fetchNumberOfHolders(address);
    console.log(numOfHolders);

    const data = {
        txnsLen,
        contractAgeInDays,
        price: dets.price,
        topHolders,
        marketCap: dets.marketCap,
        volume: dets.volume,
    };
    const payload = preparePayload("ANALYZE_RISK", data);
    const payloadSize = (payload.length - 2) / 2; // subtract '0x' and divide by 2 for bytes
    console.log("Payload size:", payloadSize, "bytes");

    console.log("Sending payload to L2...");
    const out = await sendAvailInput(account, address, payload);

    res.status(200).json({
        id: out.id,
        // id: "0x0",
        contractAgeInDays,
        name: dets.name,
        symbol: dets.symbol,
        price: dets.price,
        marketCap: dets.marketCap,
        volume: dets.volume,
        topHolders,
        contractCreationBlock: creationBlock,
        numOfHolders,
    });
});

app.get("/analyze_pool", async (req: Request, res: Response) => {
    const poolID = req.query.poolID as Hex;
    const data = await analyzePool(poolID);

    const payload = preparePayload("ANALYZE_POOL", data);
    const payloadSize = (payload.length - 2) / 2; // subtract '0x' and divide by 2 for bytes
    console.log("Payload size:", payloadSize, "bytes");

    console.log("Sending payload to L2...");
    const out = await sendAvailInput(account, account.address, payload);
    console.log(out);

    res.status(200).json({ id: out.id });
});

const server = app.listen(port, () => {
    console.log(`[BACKEND SERVICE] running at http://localhost:${port}`);
});
server.setTimeout(5 * 60 * 1000); // 5 minutes

