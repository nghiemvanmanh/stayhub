import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/cookie";
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(
            `${baseURL}/auth/refresh-token`,
            { refreshToken },
            {
              withCredentials: true,
            }
          );
          const { accessToken } = response.data;
          Cookies.set(ACCESS_TOKEN_KEY, accessToken);
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return fetcher(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove(ACCESS_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_PREFIX_API}`;