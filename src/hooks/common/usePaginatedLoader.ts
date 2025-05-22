import { useEffect, useMemo, useState } from "react";

interface PaginationOptions<TQuery extends object> {
    query: TQuery;
    pageSize?: number;
    fetchFn: (params: TQuery & { page: number; pageSize: number }) => Promise<any[]>;
    autoLoad?: boolean;
    autoLoadOnQueryChange?: boolean;
    enabled?: boolean;
}

interface UsePaginatedLoaderResult<T> {
    data: T[];
    loadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    reset: () => void;
    reload: () => void;
    initialized: boolean;
}

export function usePaginatedLoader<T = any, TQuery extends object = {}>({
                                                                            query,
                                                                            pageSize = 20,
                                                                            fetchFn,
                                                                            autoLoad = true,
                                                                            autoLoadOnQueryChange = true,
                                                                            enabled = true,
                                                                        }: PaginationOptions<TQuery>): UsePaginatedLoaderResult<T> {
    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const queryKey = useMemo(() => JSON.stringify(query), [query]);

    const loadMore = async () => {
        if (!enabled || loading || !hasMore) return;

        setLoading(true);
        try {
            const result: any = await fetchFn({ ...query, page, pageSize });
            setData(prev => [...prev, ...result.list]);
            setHasMore(pageSize === -1 ? false : result.list.length >= pageSize);
            setPage(prev => prev + 1);
            setInitialized(true);
        } catch (err) {
            console.error("分页加载失败：", err);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        if (!enabled) return;
        setData([]);
        setPage(1);
        setHasMore(true);
        setInitialized(false);
    };

    const reload = () => {
        reset();
        loadMore();
    };

    // 监听 query 改变时重置并按需加载
    useEffect(() => {
        if (!enabled) return;
        reset();
        if (autoLoadOnQueryChange) {
            loadMore();
        }
    }, [queryKey]);

    // 首次挂载是否自动加载
    useEffect(() => {
        if (!enabled) return;
        if (autoLoad) {
            loadMore();
        }
    }, [enabled]);

    return {
        data,
        loadMore,
        hasMore,
        loading,
        reset,
        reload,
        initialized,
    };
}
