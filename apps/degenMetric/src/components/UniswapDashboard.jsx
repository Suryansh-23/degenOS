import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { AlertCircle, TrendingUp, DollarSign, Activity } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useUniswapData } from "../hooks/useUniswapData";

const UniswapDashboard = () => {
    const [poolId, setPoolId] = useState(
        "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8"
    );
    const { loading, error, data: metrics, fetchPairData } = useUniswapData();

    useEffect(() => {
        fetchPairData(poolId);
    }, [fetchPairData, poolId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error loading data: {error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4">
                    Uniswap Pair Analytics
                </h1>
                <div className="flex gap-4">
                    <Input
                        type="text"
                        value={poolId}
                        onChange={(e) => setPoolId(e.target.value)}
                        placeholder="Enter pair address"
                        className="flex-grow"
                    />
                    <Button onClick={() => fetchPairData(poolId)}>
                        Analyze Pair
                    </Button>
                </div>
            </div>

            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Basic Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p>
                                    <strong>Token Pair:</strong>{" "}
                                    {metrics.basic.token0Symbol}/
                                    {metrics.basic.token1Symbol}
                                </p>
                                <p>
                                    <strong>Current Price:</strong> $
                                    {metrics.basic.currentPrice?.toFixed(4)}
                                </p>
                                <p>
                                    <strong>Total Liquidity:</strong> $
                                    {parseInt(
                                        metrics.basic.liquidity
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Advanced Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Advanced Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p>
                                    <strong>VLR:</strong>{" "}
                                    {metrics.advanced.volumeToLiquidityRatio?.toFixed(
                                        4
                                    )}
                                </p>
                                <p>
                                    <strong>Liquidity Utilization:</strong>{" "}
                                    {metrics.advanced.liquidityUtilization.rate?.toFixed(
                                        2
                                    )}
                                    %
                                </p>
                                <p>
                                    <strong>IL Risk Score:</strong>{" "}
                                    {metrics.advanced.impermanentLossRisk.riskScore?.toFixed(
                                        2
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trading Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Trading Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p>
                                    <strong>Trade Efficiency:</strong>{" "}
                                    {
                                        metrics.trading.recentTradesEfficiency
                                            .efficiency
                                    }
                                </p>
                                <p>
                                    <strong>Avg Price Impact:</strong>{" "}
                                    {metrics.trading.averagePriceImpact?.toFixed(
                                        4
                                    )}
                                    %
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Historical Price Chart */}
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>Price History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={metrics.historical.hourlyMetrics}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(timestamp) =>
                                                new Date(
                                                    timestamp * 1000
                                                ).toLocaleDateString()
                                            }
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(timestamp) =>
                                                new Date(
                                                    timestamp * 1000
                                                ).toLocaleString()
                                            }
                                            formatter={(value) => [
                                                `$${parseFloat(value)?.toFixed(
                                                    4
                                                )}`,
                                            ]}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="priceToken0"
                                            stroke="#8884d8"
                                            name="Token0 Price"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Volume Chart */}
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>Volume History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={metrics.historical.dailyMetrics}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(timestamp) =>
                                                new Date(
                                                    timestamp * 1000
                                                ).toLocaleDateString()
                                            }
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(timestamp) =>
                                                new Date(
                                                    timestamp * 1000
                                                ).toLocaleString()
                                            }
                                            formatter={(value) => [
                                                `$${parseInt(
                                                    value
                                                ).toLocaleString()}`,
                                            ]}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="volumeUSD"
                                            stroke="#82ca9d"
                                            name="Volume USD"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UniswapDashboard;
