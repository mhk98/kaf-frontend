import { apiFetch } from "@/lib/api";

export interface ResellerRegistrationInput {
  name: string;
  phone: string;
  address: string;
}

export async function registerReseller(input: ResellerRegistrationInput): Promise<void> {
  await apiFetch<{ success: boolean }>("/resellers/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
