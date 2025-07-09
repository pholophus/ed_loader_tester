import { apiConfig } from '../config/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiServiceConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiServiceConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  /**
   * Construct full URL from endpoint name
   */
  private getUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Handle HTTP requests with error handling
   */
  private async request<T = any>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
          data: data
        };
      }

      return {
        success: true,
        data: data
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout'
        };
      }

      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  /**
   * GET request - equivalent to MongoDB find
   */
  async get<T = any>(endpoint: string, query: Record<string, any> = {}): Promise<ApiResponse<T[]>> {
    const url = new URL(this.getUrl(endpoint));
    
    // Add query parameters
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined && query[key] !== null) {
        url.searchParams.append(key, typeof query[key] === 'object' ? JSON.stringify(query[key]) : query[key]);
      }
    });

    return this.request<T[]>(url.toString(), {
      method: 'GET'
    });
  }

  /**
   * GET by ID - get single document
   */
  async getById<T = any>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    const url = this.getUrl(`${endpoint}/${id}`);
    return this.request<T>(url, {
      method: 'GET'
    });
  }

  /**
   * POST request - equivalent to MongoDB insert
   */
  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * POST multiple - equivalent to MongoDB insertMany
   */
  async postMany<T = any>(endpoint: string, data: any[]): Promise<ApiResponse<T[]>> {
    const url = this.getUrl(`${endpoint}/bulk`);
    return this.request<T[]>(url, {
      method: 'POST',
      body: JSON.stringify({ documents: data })
    });
  }

  /**
   * PUT request - equivalent to MongoDB update
   */
  async put<T = any>(endpoint: string, id: string, data: any): Promise<ApiResponse<T>> {
    const url = this.getUrl(`${endpoint}/${id}`);
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH request - partial update
   */
  async patch<T = any>(endpoint: string, id: string, data: any): Promise<ApiResponse<T>> {
    const url = this.getUrl(`${endpoint}/${id}`);
    return this.request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request - equivalent to MongoDB delete
   */
  async delete<T = any>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    const url = this.getUrl(`${endpoint}/${id}`);
    return this.request<T>(url, {
      method: 'DELETE'
    });
  }

  /**
   * Custom update with filter - more MongoDB-like update
   */
  async updateWithFilter<T = any>(endpoint: string, filter: any, update: any): Promise<ApiResponse<T>> {
    const url = this.getUrl(`${endpoint}/update`);
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify({ filter, update })
    });
  }

  /**
   * Upsert operation - equivalent to MongoDB upsert
   */
  async upsert<T = any>(endpoint: string, filter: any, data: any): Promise<ApiResponse<T>> {
    const url = this.getUrl(`${endpoint}/upsert`);
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify({ filter, document: data })
    });
  }

  /**
   * Aggregation - equivalent to MongoDB aggregation
   */
  async aggregate<T = any>(endpoint: string, pipeline: any[]): Promise<ApiResponse<T[]>> {
    const url = this.getUrl(`${endpoint}/aggregate`);
    return this.request<T[]>(url, {
      method: 'POST',
      body: JSON.stringify({ pipeline })
    });
  }

  /**
   * Count documents
   */
  async count(endpoint: string, query: Record<string, any> = {}): Promise<ApiResponse<{ count: number }>> {
    const url = this.getUrl(`${endpoint}/count`);
    return this.request<{ count: number }>(url, {
      method: 'POST',
      body: JSON.stringify(query)
    });
  }
}

// Create and export the default API service instance
export const apiService = new ApiService({
  baseUrl: apiConfig.baseUrl,
  timeout: apiConfig.timeout
});

// Export the class for custom instances if needed
export { ApiService };
export type { ApiResponse, ApiServiceConfig }; 