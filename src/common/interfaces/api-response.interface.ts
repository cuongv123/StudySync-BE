/**
 * ApiResponse Interface
 *
 * Defines standard structure for all API responses in the application.
 * This interface is used by TransformInterceptor to ensure all API responses
 * follow a consistent format.
 *
 * @template T - Data type of the response data
 * @property {T} data - Actual response data from endpoint
 * @property {number} statusCode - HTTP status code of the response
 * @property {string} message - Message describing the result of the request
 * @property {string} timestamp - Timestamp when response was created (ISO format)
 */
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  // Legacy support
  page?: number;
  limit?: number;
  total?: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}
