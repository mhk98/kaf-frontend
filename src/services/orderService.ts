import { apiFetch } from "@/lib/api";
import { ApiResponse, ApiOrder, CreateOrderPayload } from "@/types/api";

export async function saveIncompleteOrder(
  payload: CreateOrderPayload,
  signal?: AbortSignal,
): Promise<ApiOrder> {
  const res = await apiFetch<ApiResponse<ApiOrder>>("/orders/incomplete", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
  return res.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiOrder> {
  const res = await apiFetch<ApiResponse<ApiOrder>>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
