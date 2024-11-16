import { useState, useCallback } from "react";
import UniswapAnalytics from "../utils/UniswapAnalytics";

export const useUniswapData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchPairData = useCallback(async (id) => {
        setLoading(true);
        setError(null);

        try {
            const analytics = new UniswapAnalytics();
            const metrics = await analytics.analyzePool(id);
            setData(metrics);
            return metrics;
        } catch (error) {
            const errorMessage = error.message || "Failed to fetch pair data";
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(() => {
        if (data?.basic?.address) {
            return fetchPairData(data.basic.address);
        }
    }, [data, fetchPairData]);

    return {
        loading,
        error,
        data,
        fetchPairData,
        refetch,
    };
};

export default useUniswapData;
