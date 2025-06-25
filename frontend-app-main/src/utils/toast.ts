import { AxiosError } from 'axios';

export type ToastType = 'success' | 'error';

export interface ToastState {
  show: boolean;
  type: ToastType;
  message: string;
}

export const handleApiResponse = (
  response: any,
  onSuccess: (message: string) => void,
  onError: (message: string) => void
) => {
  if (response.data?.success) {
    onSuccess(response.data.message || 'Operation successful');
  } else {
    // Extract error message from response
    const errorMessage = response.data?.message || 
                        response.data?.error?.message || 
                        response.data?.error || // Direct error message
                        response.data?.errors?.join(', ') || 
                        'Operation failed';
    onError(errorMessage);
  }
};

export const handleApiError = (
  error: AxiosError,
  onError: (message: string) => void
) => {
  if (error.response) {
    const responseData = error.response.data as any;
    
    // Try to extract error message from different possible response formats
    const errorMessage = responseData?.message || 
                        responseData?.error?.message || 
                        responseData?.error || // Direct error message
                        responseData?.errors?.join(', ') || 
                        getDefaultErrorMessage(error.response.status);

    onError(errorMessage);
  } else if (error.request) {
    onError('Network error. Please check your connection');
  } else {
    onError('An unexpected error occurred');
  }
};

const getDefaultErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'Bad request. Please check your input';
    case 401:
      return 'Session expired. Please login again';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Conflict: Resource already exists';
    case 500:
      return 'Server error. Please try again later';
    default:
      return 'An error occurred';
  }
}; 