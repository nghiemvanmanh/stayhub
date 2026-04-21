import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/cookie";
import { isTokenExpired } from "@/lib/tokenUtils";
import axios from "axios";
import Cookies from "js-cookie";
export const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_PREFIX_API}`;

export const fetcher = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

const refreshTokenHandler = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const response = await axios.post(
      `${baseURL}/auth/refresh-token`,
      { refreshToken },
      { withCredentials: true },
    );

    const nextAccessToken =
      response.data?.accessToken ??
      response.data?.data?.accessToken ??
      response.data?.tokens?.accessToken;

    if (!nextAccessToken) {
      throw new Error("Refresh token response missing accessToken");
    }

    Cookies.set(ACCESS_TOKEN_KEY, nextAccessToken);

    processQueue(null, nextAccessToken);
    return nextAccessToken;
  } catch (error) {
    processQueue(error, null);
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    window.location.href = "/";
    throw error;
  } finally {
    isRefreshing = false;
  }
};

fetcher.interceptors.request.use(
  async (config) => {
    let token = Cookies.get(ACCESS_TOKEN_KEY);

    if (token && isTokenExpired(token)) {
      try {
        token = await refreshTokenHandler();
      } catch (error) {
        return Promise.reject(error);
      }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

fetcher.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const nextAccessToken = await refreshTokenHandler();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers["Authorization"] = `Bearer ${nextAccessToken}`;
        return fetcher(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status >= 500 &&
      window?.location?.pathname !== "/500"
    ) {
      window.location.href = "/500";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
