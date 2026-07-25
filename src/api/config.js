// panama-signature/src/api/config.js
// Single source of truth for the API base URL and image resolution.
// Swap the env var (or the fallback) when deploying — nowhere else needs to change.
// export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "panamasignature.com";


// Resolves a possibly-relative media path (e.g. "/media/x.jpg") returned by the
// API into a fully-qualified URL. Absolute URLs (http/https) pass through untouched.
export function resolveImage(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

export default BASE_URL;