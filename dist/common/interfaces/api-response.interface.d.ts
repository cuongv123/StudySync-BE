export interface ApiResponse<T> {
    data: T;
    statusCode: number;
    message: string;
    timestamp: string;
}
export interface PaginationMeta {
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    page?: number;
    limit?: number;
    total?: number;
}
export interface PaginatedData<T> {
    items: T[];
    meta: PaginationMeta;
}
