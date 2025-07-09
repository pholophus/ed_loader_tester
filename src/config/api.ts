interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// Configuration - Change these values as needed
// For environment-specific configuration, update these values or 
// modify this file to read from your preferred configuration source
export const apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 30000
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = apiConfig.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
};

// Export individual config values for convenience
export const API_BASE_URL = apiConfig.baseUrl;
export const API_TIMEOUT = apiConfig.timeout; 