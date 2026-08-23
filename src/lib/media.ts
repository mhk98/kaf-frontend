const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "https://server.kaflifestylebd.com"
).replace(/\/$/, "");
export const FALLBACK_IMAGE = "/placeholder.svg";

export function resolveMediaUrl(
  value: unknown,
  fallback = FALLBACK_IMAGE,
): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const source = value.trim().replace(/\\/g, "/");
  if (/^(https?:|data:|blob:)/i.test(source)) return source;
  if (source.startsWith("/images/")) return source;
  if (source.startsWith("images/")) return `/${source}`;
  if (source.startsWith("/")) return source;
  return `/images/${source}`;
}

export function resolveAbsoluteMediaUrl(value: unknown): string {
  const resolved = resolveMediaUrl(value);
  return resolved.startsWith("/") ? `${API_ORIGIN}${resolved}` : resolved;
}
