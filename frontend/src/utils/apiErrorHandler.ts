import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Handle network errors
    if (!axiosError.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      };
    }

    // Handle HTTP errors
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;

    switch (status) {
      case 400:
        return {
          message: data?.message || 'Invalid request. Please check your input.',
          status,
          code: 'BAD_REQUEST'
        };
      case 401:
        return {
          message: data?.message || 'Authentication failed. Please log in again.',
          status,
          code: 'UNAUTHORIZED'
        };
      case 403:
        return {
          message: data?.message || 'Access denied. You do not have permission to perform this action.',
          status,
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: data?.message || 'Resource not found.',
          status,
          code: 'NOT_FOUND'
        };
      case 409:
        return {
          message: data?.message || 'Conflict. The resource already exists.',
          status,
          code: 'CONFLICT'
        };
      case 422:
        return {
          message: data?.message || 'Validation error. Please check your input.',
          status,
          code: 'VALIDATION_ERROR'
        };
      case 500:
        return {
          message: 'Internal server error. Please try again later.',
          status,
          code: 'SERVER_ERROR'
        };
      default:
        return {
          message: data?.message || 'An unexpected error occurred.',
          status,
          code: 'UNKNOWN_ERROR'
        };
    }
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'GENERAL_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR'
  };
};

export const isNetworkError = (error: ApiError): boolean => {
  return error.code === 'NETWORK_ERROR';
};

export const isAuthError = (error: ApiError): boolean => {
  return error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN';
};

export const isValidationError = (error: ApiError): boolean => {
  return error.code === 'VALIDATION_ERROR' || error.code === 'BAD_REQUEST';
}; 