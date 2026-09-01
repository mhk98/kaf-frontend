import { BASE, IMAGES } from "@/lib/api";

export interface ClientItem {
  Id: number;
  name: string;
  file: string;
  linkUrl: string | null;
  sortOrder: number;
}

function toUrl(file: string): string {
  if (file.startsWith("data:")) return file;
  if (file.startsWith("http")) return file;
  return `${IMAGES}/${file}`;
}

export async function fetchClients(): Promise<ClientItem[]> {
  try {
    const res = await fetch(`${BASE}/clients/public`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((c: ClientItem) => ({
      ...c,
      file: toUrl(c.file),
    }));
  } catch {
    return [];
  }
}
