import { api } from "./api";
import type { Order } from "@grocery/shared";

export function getMyOrders() {
  return api.get<Order[]>("/orders");
}

export function getAllOrders() {
  return api.get<Order[]>("/orders/all");
}

export function createOrder(data: { items: { productId: number; quantity: number }[]; deliveryLocation?: string; paymentMethod?: string }) {
  return api.post<Order>("/orders", data);
}

export function updateOrderStatus(id: number, status: string, cancelReason?: string) {
  return api.patch(`/orders/${id}/status`, { status, cancelReason });
}
