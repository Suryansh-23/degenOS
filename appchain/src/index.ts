import createClient from "openapi-fetch";
import { components, paths } from "./schema";
import { hexToString, stringToHex } from "viem";
import { calculateRiskScore, msg } from "./riskAnalyzer/riskAnalyzer";

type AdvanceRequestData = components["schemas"]["Advance"];
type InspectRequestData = components["schemas"]["Inspect"];
type RequestHandlerResult = components["schemas"]["Finish"]["status"];
type RollupsRequest = components["schemas"]["RollupRequest"];
type InspectRequestHandler = (data: InspectRequestData) => Promise<void>;
type AdvanceRequestHandler = (
    data: AdvanceRequestData
) => Promise<RequestHandlerResult>;
export type Notice = components["schemas"]["Notice"];
export type Payload = components["schemas"]["Payload"];
export type Report = components["schemas"]["Report"];
export type Voucher = components["schemas"]["Voucher"];

const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollupServer);

const createNotice = async (payload: Notice) => {
    console.log("creating notice with payload", payload);

    await fetch(`${rollupServer}/notice`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

const createVoucher = async (payload: Voucher) => {
    await fetch(`${rollupServer}/voucher`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

const createReport = async (payload: Report) => {
    await fetch(`${rollupServer}/report`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

const handleAdvance: AdvanceRequestHandler = async (data) => {
    console.log("Received advance request data " + JSON.stringify(data));

    const dataPayload = data.payload as Payload;
    const payload = JSON.parse(hexToString(dataPayload)) as {
        operation: string;
        msg: unknown;
    };
    switch (payload.operation) {
        case "LOGIN":
            break;
        case "ANALYZE_RISK":
            console.log(payload.msg);

            try {
                const args = payload.msg as msg;
                const res = calculateRiskScore(args);
                console.log(res);

                await createNotice({
                    payload: stringToHex(JSON.stringify(res)),
                });
            } catch (error) {
                console.error("Error processing sent msg:", error);
            }
            break;
        default:
            console.error("Unknown operation type");
            break;
    }

    return "accept";
};

const handleInspect: InspectRequestHandler = async (data) => {
    console.log("Received inspect request data " + JSON.stringify(data));
};

const main = async () => {
    const { POST } = createClient<paths>({ baseUrl: rollupServer });
    let status: RequestHandlerResult = "accept";
    while (true) {
        const { response } = await POST("/finish", {
            body: { status },
            parseAs: "text",
        });

        if (response.status === 200) {
            const data = (await response.json()) as RollupsRequest;
            switch (data.request_type) {
                case "advance_state":
                    status = await handleAdvance(
                        data.data as AdvanceRequestData
                    );
                    break;
                case "inspect_state":
                    await handleInspect(data.data as InspectRequestData);
                    break;
            }
        } else if (response.status === 202) {
            console.log(await response.text());
        }
    }
};

main().catch((e) => {
    console.log(e);
    process.exit(1);
});

