import { supabase } from "./supabase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://growth-os-backend-ebon.vercel.app";

async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(
      `Unable to get authentication session: ${error.message}`
    );
  }

  if (!session?.access_token) {
    throw new Error(
      "No Supabase access token found. Please log in again."
    );
  }

  return session.access_token;
}

export async function apiRequest(
  endpoint,
  options = {}
) {
  const token = await getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `API request failed with status ${response.status}`
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