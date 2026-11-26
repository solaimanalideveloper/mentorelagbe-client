import axios, {
  type InternalAxiosRequestConfig,
} from "axios";
import { authClient } from "@/lib/auth-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const tokenStorageKey = "mentorlagbe-api-token";
let cachedToken: string | null = null;
let tokenRequest: Promise<string> | null = null;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function readStoredToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(tokenStorageKey);
}

export function clearApiToken() {
  cachedToken = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(tokenStorageKey);
  }
}

export async function getApiToken(forceRefresh = false): Promise<string> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  if (forceRefresh) {
    clearApiToken();
  } else {
    const storedToken = readStoredToken();
    const availableToken = cachedToken ?? storedToken;
    if (availableToken) {
      cachedToken = availableToken;
      return availableToken;
    }
    if (tokenRequest) return tokenRequest;
  }

  const request = (async () => {
    const response = await fetch(`${apiBaseUrl}/api/token`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Your session has expired. Please sign in again."
          : `Unable to get an API token (HTTP ${response.status}).`,
      );
    }

    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("token" in body) ||
      typeof body.token !== "string" ||
      body.token.length === 0
    ) {
      throw new Error("The API returned an invalid token response.");
    }

    cachedToken = body.token;
    window.sessionStorage.setItem(tokenStorageKey, body.token);
    return body.token;
  })();

  tokenRequest = request;
  try {
    return await request;
  } finally {
    if (tokenRequest === request) tokenRequest = null;
  }
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const publicApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = await getApiToken();
  config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const request = error.config as RetriableRequestConfig | undefined;
    if (!request) return Promise.reject(error);

    if (request._retry) {
      clearApiToken();
      try {
        await authClient.signOut();
      } catch (signOutError) {
        console.error("Could not sign out after an expired API session.", signOutError);
      }
      if (typeof window !== "undefined") {
        window.location.replace("/sign-in");
      }
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const token = await getApiToken(true);
      request.headers.set("Authorization", `Bearer ${token}`);
      return await api(request);
    } catch (refreshError) {
      clearApiToken();
      try {
        await authClient.signOut();
      } catch (signOutError) {
        console.error("Could not sign out after token refresh failed.", signOutError);
      }
      if (typeof window !== "undefined") {
        window.location.replace("/sign-in");
      }
      return Promise.reject(refreshError);
    }
  },
);
