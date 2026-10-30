import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, TokenDto } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to resolve currently stored culture code
export const getActiveCultureCode = (): string => {
  try {
    const stored = localStorage.getItem('imasjid_selected_locale');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.cultureCode) return parsed.cultureCode;
    }
  } catch {
    // fallback
  }
  return 'id-ID';
};

// Initialize common headers from stored locale
const initialCulture = getActiveCultureCode();
apiClient.defaults.headers.common['Accept-Language'] = initialCulture;
apiClient.defaults.headers.common['X-Culture'] = initialCulture;
apiClient.defaults.headers.common['X-Language'] = initialCulture.split('-')[0].toLowerCase();

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach Bearer token and language culture headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach selected language & culture to every service call
    const culture = getActiveCultureCode();
    const lang = culture.split('-')[0].toLowerCase();

    if (config.headers) {
      config.headers['Accept-Language'] = culture;
      config.headers['X-Culture'] = culture;
      config.headers['X-Language'] = lang;

      // Ensure AxiosHeaders instance also updates via .set
      if (typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('Accept-Language', culture);
        (config.headers as any).set('X-Culture', culture);
        (config.headers as any).set('X-Language', lang);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: proactive 401 token refresh queue & normalize success flag
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      const isOk = response.data.success ?? response.data.isSuccess ?? (response.status >= 200 && response.status < 300);
      response.data.success = isOk;
      response.data.isSuccess = isOk;
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');

      if (!refreshToken || !accessToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<TokenDto>>(
          `${API_BASE_URL.replace(/\/+$/, '')}/auth/refresh`,
          { accessToken, refreshToken }
        );

        const isOk = response.data?.success ?? response.data?.isSuccess;
        if (isOk && response.data.data) {
          const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
          localStorage.setItem('access_token', newAccess);
          localStorage.setItem('refresh_token', newRefresh);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }
          processQueue(null, newAccess);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiRes = error.response?.data as any;
    if (apiRes?.message) return apiRes.message;
    if (apiRes?.errors) {
      if (Array.isArray(apiRes.errors)) {
        return apiRes.errors
          .map((e: any) => (typeof e === 'string' ? e : e?.message || e?.field || JSON.stringify(e)))
          .join(', ');
      }
      return String(apiRes.errors);
    }
    if (error.message) return error.message;
  }
  return (error as Error)?.message || 'An unexpected error occurred.';
};
