import { create } from "zustand";
import { addToCart, getCart, removeFromCart, clearCart } from "../services/cart";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (productId: number, quantity: number) => Promise<void>;
  remove: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  totalQuantity: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      set({ items: await getCart() });
    } finally {
      set({ loading: false });
    }
  },

  add: async (productId: number, quantity: number) => {
    await addToCart(productId, quantity);
    await get().fetch();
  },

  remove: async (productId: number) => {
    await removeFromCart(productId);
    await get().fetch();
  },

  clear: async () => {
    await clearCart();
    set({ items: [] });
  },

  totalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
