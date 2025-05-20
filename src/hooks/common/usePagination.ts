import { useState } from "react";

export function usePagination(defaultPageSize = 15) {
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: defaultPageSize,
    });

    const handlePaginationChange = (page: number, pageSize: number) => {
        setPagination({ page, pageSize });
    };

    function resetPage() {
        setPagination(prev => ({ ...prev, page: 1 }));
    }

    return {
        pagination,
        setPagination,
        handlePaginationChange,
        resetPage,
    };
}