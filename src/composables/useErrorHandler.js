export function useErrorHandler() {
  const handleError = (error, defaultMessage = '操作失敗') => {
    console.error('Error:', error);
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return defaultMessage;
  };

  return {
    handleError
  };
}