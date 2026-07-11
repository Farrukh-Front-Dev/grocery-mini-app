// --- Shared types ---

export type OrderStatus = "yangi" | "tayyorlanmoqda" | "yetkazildi" | "bekor_qilindi";
export type PaymentMethod = "naqd" | "online";
export type Unit = "kg" | "litr" | "dona";

export interface User {
  id: number;
  telegramId: number;
  name: string;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  unit: Unit;
  step: number;
  image: string | null;
  stockQty: number;
  isActive: boolean;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryLocation: string | null;
  status: OrderStatus;
  cancelReason: string | null;
  createdAt: string;
  deliveredAt: string | null;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  createdByAdminId: number;
  createdAt: string;
}

// --- API response wrappers ---

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  error: string;
  field?: string;
}

// --- Constants ---

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  "yangi",
  "tayyorlanmoqda",
  "yetkazildi",
  "bekor_qilindi",
];

export const VALID_UNITS: Unit[] = ["kg", "litr", "dona"];
