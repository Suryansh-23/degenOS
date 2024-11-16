"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import request from "graphql-request";
import { Loader2, RefreshCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Radar } from "recharts";

interface TokenDetails {
    id: string; // assuming id is a string, adjust if different
    contractAgeInDays: number;
    name: string;
    symbol: string;
    price: number;
    marketCap: number;
    volume: number;
    topHolders: Array<{
        address: string;
        percentage: number;
    }>; // assuming topHolders is an array of holders with address and balance
    contractCreationBlock: number;
    numOfHolders: number;
}

interface RiskScore {
    finalScore: number;
    detailedScores: DetailedScore[];
}

interface DetailedScore {
    label: string;
    description: string;
    score: string | number; // Using union type since score appears as both string and number
}

const fetchInitialData = async (address: string) => {
    const res = await fetch(
        `http://localhost:4200/analyze_token?address=${address}`
    );
    if (!res.ok) {
        throw new Error("Failed to fetch token data");
    }

    return (await res.json()) as TokenDetails;
};

const graphQLQuery = `
query ($id: String!) {
  input(
    id: $id
  ) {
    id
    index
    status
    blockTimestamp
    msgSender
    payload
    notices {
      edges {
        node {
          payload
        }
      }
    }
  }
}
`;

const fetchRiskAnalysis = async (id: string) => {
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 2000;

    for (let i = 0; i < MAX_RETRIES; i++) {
        const fetchData = await request(
            `http://localhost:8080/graphql/0x2291ba684ea6bCA81caCE56fcc1194A84086C912`,
            `
query {
  input(
    id: "${id}"
  ) {
    id
    index
    status
    blockTimestamp
    msgSender
    payload
    notices {
      edges {
        node {
          payload
        }
      }
    }
  }
}`
        );
        console.log(fetchData);

        // if (response.finalScore) {
        //     return response as RiskScore;
        // }

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
};

export default function App() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [initialData, setInitialData] = useState<TokenDetails | null>(null);
    const [riskAnalysis, setRiskAnalysis] = useState<RiskScore | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        setLoading(true);
        setInitialData(null);
        setRiskAnalysis(null);
        try {
            const data = await fetchInitialData(tokenAddress);
            console.log("Token data:", data);
            setInitialData(data);
            const risk = await fetchRiskAnalysis(data.id);
            console.log("Risk analysis:", risk);
            setRiskAnalysis(risk || null);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({
                title: "Error",
                description: "Failed to fetch token data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            const intervalId = setInterval(async () => {
                setUpdating(true);
                try {
                    const risk = await fetchRiskAnalysis(initialData.id);
                    setRiskAnalysis(risk || null);
                } catch (error) {
                    console.error("Error updating risk analysis:", error);
                }
                setUpdating(false);
            }, 30000); // Update every 30 seconds

            return () => clearInterval(intervalId);
        }
    }, [initialData]);

    const riskChartData = riskAnalysis
        ? riskAnalysis.detailedScores
              .filter((score) => score.label !== "Final Risk Score")
              .map((score) => ({
                  subject: score.label,
                  risk: parseFloat(score.score as string),
              }))
        : [];

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Token Analyzer</h1>

            {/* Search Field */}
            <Card>
                <CardHeader>
                    <CardTitle>Analyze Token</CardTitle>
                    <CardDescription>
                        Enter the token address to analyze
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Input
                            type="text"
                            placeholder="Token Address (e.g., 0x123456789...)"
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            className="flex-grow"
                        />
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="mr-2 h-4 w-4" />
                            )}
                            Analyze
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Token Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Token Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                    ) : initialData ? (
                        <>
                            <p>
                                <strong>Name:</strong> {initialData.name}
                            </p>
                            <p>
                                <strong>Symbol:</strong> {initialData.symbol}
                            </p>
                            <p>
                                <strong>Price:</strong> ${initialData.price}
                            </p>
                            <p>
                                <strong>Market Cap:</strong> $
                                {initialData.marketCap}
                            </p>
                            <p>
                                <strong>Volume:</strong> ${initialData.volume}
                            </p>
                        </>
                    ) : (
                        <p>
                            No data available. Please enter a token address and
                            click Analyze.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Contract Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Contract Information</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[300px]" />
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    ) : initialData ? (
                        <>
                            <p>
                                <strong>Contract Age:</strong>{" "}
                                {initialData.contractAgeInDays} days
                            </p>
                            <p>
                                <strong>Creation Block:</strong>{" "}
                                {initialData.contractCreationBlock}
                            </p>
                            <p>
                                <strong>Number of Holders:</strong>{" "}
                                {initialData.numOfHolders.toLocaleString()}
                            </p>
                        </>
                    ) : (
                        <p>
                            No data available. Please enter a token address and
                            click Analyze.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Top Holders */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Holders</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-[200px] w-full" />
                    ) : initialData ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialData.topHolders.map((holder, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{holder.address}</TableCell>
                                        <TableCell>
                                            {holder.percentage}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>
                            No data available. Please enter a token address and
                            click Analyze.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Risk Analysis
                        {updating && (
                            <RefreshCcw className="h-4 w-4 animate-spin" />
                        )}
                    </CardTitle>
                    <CardDescription>
                        Individual risk factors and final risk score
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-6">
                    {loading ? (
                        <>
                            <Skeleton className="h-[300px] w-full md:w-1/2" />
                            <div className="w-full md:w-1/2 space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </>
                    ) : riskAnalysis ? (
                        <>
                            <div className="w-full md:w-1/2">
                                <ChartContainer
                                    config={{
                                        risk: {
                                            label: "Risk",
                                            color: "hsl(var(--chart-1))",
                                        },
                                    }}
                                    className="h-[300px]">
                                    <Radar
                                        data={riskChartData}
                                        dataKey="risk"
                                        name="Risk"
                                        stroke="var(--color-risk)"
                                        fill="var(--color-risk)"
                                        fillOpacity={0.6}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                </ChartContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                                {riskAnalysis.detailedScores.map(
                                    (score, index) => (
                                        <div key={index}>
                                            <p className="font-semibold">
                                                {score.label}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {score.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <Progress
                                                    value={parseFloat(
                                                        score.score
                                                    )}
                                                    className="h-2 flex-grow mr-2"
                                                />
                                                <span className="text-sm font-medium">
                                                    {parseFloat(
                                                        score.score
                                                    ).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    ) : (
                        <p>
                            No risk analysis available. Please enter a token
                            address and click Analyze.
                        </p>
                    )}
                </CardContent>
            </Card>

            {loading && (
                <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
        </div>
    );
}

