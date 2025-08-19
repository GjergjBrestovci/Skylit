// API utility with automatic token refresh
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private baseUrl = 'http://localhost:5000';
  private getToken = () => localStorage.getItem('authToken');
  private getRefreshToken = () => localStorage.getItem('refreshToken');
  private setTokens = (token: string, refreshToken?: string) => {
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  };
  private clearTokens = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  };

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async request(endpoint: string, options: ApiOptions = {}): Promise<any> {
    const { method = 'GET', headers = {}, body } = options;
    
    const makeRequest = async (token?: string) => {
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers
      };

      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      return fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined
      });
    };

    // First attempt with current token
    const token = this.getToken();
    let response = await makeRequest(token || undefined);

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && token) {
      const refreshed = await this.refreshAccessToken();
      
      if (refreshed) {
        // Retry with new token
        const newToken = this.getToken();
        response = await makeRequest(newToken || undefined);
      } else {
        // Refresh failed, clear tokens and redirect to login
        this.clearTokens();
        window.location.reload(); // This will trigger the auth check in App.tsx
        throw new Error('Session expired. Please log in again.');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Convenience methods
  async get(endpoint: string, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  async post(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'POST', body, headers });
  }

  async put(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'PUT', body, headers });
  }

  async delete(endpoint: string, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
