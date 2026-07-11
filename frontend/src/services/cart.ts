import { api } from "./api";

export function getCart() {
  return api.get<{ id: number; userId: number; productId: number; quantity: number }[]>("/cart");
}

export function addToCart(productId: number, quantity: number) {
  return api.post("/cart", { productId, quantity });
}

export function removeFromCart(productId: number) {
  return api.delete(`/cart/${productId}`);
}

export function clearCart() {
  return api.delete("/cart");
}
