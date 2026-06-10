import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  price: number
  accent: string
  size: string
  qty: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void
  setQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clear: () => void
  subtotal: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + qty } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, qty }] }
        }),

      setQty: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] }),

      subtotal: () => get().items.reduce((acc, i) => acc + i.price * i.qty, 0),

      count: () => get().items.reduce((acc, i) => acc + i.qty, 0),
    }),
    { name: "liquor-cart-v1" }
  )
)
