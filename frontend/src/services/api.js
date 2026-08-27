const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "growthos_token";

function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated. Please log in.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    { ...options, headers }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `API request failed with status ${response.status}`
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

export const api = {
  get(endpoint) {
    return apiRequest(endpoint);
  },

  post(endpoint, data) {
    return apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return apiRequest(endpoint, {
      method: "DELETE",
    });
  },
};
