const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

export const API_URL = configuredApiUrl || "http://localhost:8000";

export function getApiUrl() {
  if (configuredApiUrl) return configuredApiUrl;
  if (typeof window !== "undefined") return `http://${window.location.hostname}:8000`;
  return API_URL;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, init);
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try { detail = (await response.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  return response.json();
}
