import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/cookie";
import { isTokenExpired } from "@/lib/tokenUtils";
import axios from "axios";
import Cookies from "js-cookie";
export const fetcher = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_PREFIX_API}`,
  withCredentials: true,
});

fetcher.interceptors.request.use(
  (config) => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

fetcher.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status >= 500 &&
      window?.location?.pathname !== "/500"
    ) {
      window.location.href = "/500";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        Cookies.remove(ACCESS_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        // await axios.post(`${baseURL}/auth/logout`, null, { withCredentials: true }).catch(() => {});
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Gom các request bị 401 vào hàng đợi (queue) để đợi token mới
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return fetcher(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          { refreshToken },
          {
            withCredentials: true,
          },
        );

        const nextAccessToken =
          response.data?.accessToken ??
          response.data?.data?.accessToken ??
          response.data?.tokens?.accessToken;

        if (!nextAccessToken) {
          throw new Error("Refresh token response missing accessToken");
        }

        Cookies.set(ACCESS_TOKEN_KEY, nextAccessToken);

        // Chạy lại các request đang đợi
        processQueue(null, nextAccessToken);

        // Gọi lại request gốc
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers["Authorization"] = `Bearer ${nextAccessToken}`;
        return fetcher(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        Cookies.remove(ACCESS_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        // await axios.post(`${baseURL}/auth/logout`, null, { withCredentials: true }).catch(() => {});
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_PREFIX_API}`;
