const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api/v1"
).replace(/\/$/, "");

const SESSION_EXPIRED_EVENT = "pathforge:session-expired";
let refreshPromise = null;

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const notifySessionExpired = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
};

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new ApiError(
            response.status,
            data?.message || "Your session has expired",
            data,
          );
        }
        return data;
      })
      .catch((error) => {
        notifySessionExpired();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const request = async (endpoint, options = {}) => {
  const {
    method = "GET",
    headers = {},
    body,
    params,
    timeout = 15000, // 15 seconds default timeout
    signal,
    _retry = false, // Track retry attempt to prevent infinite loops
    ...customConfig
  } = options;

  // Build query string if parameters object is provided
  let queryString = "";
  if (params && typeof params === "object") {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const stringParams = searchParams.toString();
    if (stringParams) {
      queryString = `?${stringParams}`;
    }
  }

  const url = `${BASE_URL}${endpoint}${queryString}`;

  const configHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  // Automatic JSON serialization
  let serializedBody = body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    serializedBody = JSON.stringify(body);
  } else if (body instanceof FormData) {
    delete configHeaders["Content-Type"];
  }

  // Setup AbortController for request timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Link signal if user supplied one in option overrides
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  const config = {
    method,
    headers: configHeaders,
    body: serializedBody,
    credentials: "include", // cookies support
    signal: controller.signal,
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Automatic JSON parsing
    let responseData = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      // Intercept 401 and try silent token refresh
      if (
        response.status === 401 &&
        !_retry &&
        endpoint !== "/auth/login" &&
        endpoint !== "/auth/refresh" &&
        endpoint !== "/auth/register"
      ) {
        await refreshSession();
        return await request(endpoint, { ...options, _retry: true });
      }

      const errorMessage = responseData?.message || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, errorMessage, responseData);
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms or was cancelled.`);
    }
    throw error;
  }
};

export { SESSION_EXPIRED_EVENT };

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PUT", body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};

export default api;
