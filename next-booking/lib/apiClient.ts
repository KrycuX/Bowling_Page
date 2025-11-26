import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn('NEXT_PUBLIC_API_URL is not set. API calls will fail.');
}

export const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 15_000, // Zwiększono timeout
  headers: {
    'Content-Type': 'application/json'
  },
  // Optymalizacje HTTP
  maxRedirects: 3,
  validateStatus: (status) => status < 500, // Nie traktuj 4xx jako błędy
});

// Interceptor dla lepszego cache'owania
apiClient.interceptors.request.use((config) => {
  // Dodaj timestamp dla unikania cache'owania GET requestów
  if (config.method === 'get' && !config.params) {
    config.params = { _t: Date.now() };
  }
  return config;
});

// Interceptor dla obsługi błędów
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logowanie błędów w development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Wrapper function to match the apiFetch signature used by other hooks
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = init.headers as Record<string, string> || {};
  
  const config = {
    method: method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch',
    headers,
    ...(init.body && { data: init.body })
  };

  try {
    const response = await apiClient.request<T>({
      url: path,
      ...config
    });
    return response.data;
  } catch (error: unknown) {
    // Convert axios error to match expected error format
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; statusText: string } };
      if (axiosError.response) {
        throw new Error(`API request failed: ${axiosError.response.status} ${axiosError.response.statusText}`);
      }
    }
    throw error;
  }
}