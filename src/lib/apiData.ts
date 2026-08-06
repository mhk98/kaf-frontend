export function unwrapApiData<T>(response: unknown, fallback: T): T {
  if (response == null) return fallback;
  let current: unknown = response;
  for (let depth = 0; depth < 4; depth += 1) {
    if (current == null) return fallback;
    if (Array.isArray(current)) return current as T;
    if (typeof current !== "object") return current as T;
    const record = current as Record<string, unknown>;
    const next = record.data ?? record.results ?? record.result ?? record.payload;
    if (next === undefined) return current as T;
    current = next;
  }
  return (current ?? fallback) as T;
}

export function unwrapApiList<T>(response: unknown): T[] {
  const value = unwrapApiData<unknown>(response, []);
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const list = record.items ?? record.rows ?? record.products ?? record.categories;
    if (Array.isArray(list)) return list as T[];
  }
  return [];
}
