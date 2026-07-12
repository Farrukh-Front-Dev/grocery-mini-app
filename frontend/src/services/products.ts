import { api, request } from "./api";
import type { Product, Category } from "@grocery/shared";

export function getProducts() {
  return api.get<Product[]>("/products");
}

export function getCategories() {
  return api.get<Category[]>("/products/categories");
}

export function createProduct(data: Partial<Product>) {
  return api.post<Product>("/products", data);
}

export function updateProduct(id: number, data: Partial<Product>) {
  return api.patch<Product>(`/products/${id}`, data);
}

export function deleteProduct(id: number) {
  return api.delete(`/products/${id}`);
}

export function createCategory(data: { name: string; icon: string }) {
  return api.post<Category>("/categories", data);
}

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return request<{ url: string }>("/upload", {
    method: "POST",
    headers: {},
    body: formData,
  });
}
