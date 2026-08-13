export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  unread?: number;
}

export interface ApiListSuccess<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code:
      | 'BAD_REQUEST'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'VALIDATION_ERROR'
      | 'RATE_LIMITED'
      | 'TOKEN_EXPIRED'
      | 'INTERNAL_ERROR';
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
