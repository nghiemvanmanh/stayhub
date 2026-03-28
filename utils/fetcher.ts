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
  }
);

fetcher.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const currentAccessToken = Cookies.get(ACCESS_TOKEN_KEY);
    if (currentAccessToken && isTokenExpired(currentAccessToken)) {
      Cookies.remove(ACCESS_TOKEN_KEY);
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          await axios.post(`${baseURL}/auth/logout`, null, { withCredentials: true });
          Cookies.remove(ACCESS_TOKEN_KEY);
          Cookies.remove(REFRESH_TOKEN_KEY);
          return Promise.reject(error);
        }
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          { refreshToken },
          {
            withCredentials: true,
          }
        );

        const nextAccessToken =
          response.data?.accessToken ??
          response.data?.data?.accessToken ??
          response.data?.tokens?.accessToken;

        if (!nextAccessToken) {
          throw new Error("Refresh token response missing accessToken");
        }

        Cookies.set(ACCESS_TOKEN_KEY, nextAccessToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers["Authorization"] = `Bearer ${nextAccessToken}`;
        return fetcher(originalRequest);
      } catch (refreshError) {
        Cookies.remove(ACCESS_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        await axios.post(`${baseURL}/auth/logout`, null, { withCredentials: true });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_PREFIX_API}`;