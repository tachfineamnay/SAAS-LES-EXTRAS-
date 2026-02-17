type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  cache?: RequestCache;
};

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

function toErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate = payload as { message?: string | string[] };
  if (typeof candidate.message === "string") {
    return candidate.message;
  }

  if (Array.isArray(candidate.message)) {
    return candidate.message.join(", ");
  }

  return fallback;
}

export function getApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    cache: options.cache ?? "no-store",
    headers: {
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const fallback = `API request failed (${response.status})`;
    throw new Error(toErrorMessage(payload, fallback));
  }

  return payload as T;
}
