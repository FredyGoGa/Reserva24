import { beforeEach, describe, expect, it } from "vitest"
import { useCartStore } from "./cart.store"

const bottle = {
  id: "ron-medellin-anejo-750",
  name: "Ron Medellin Anejo",
  price: 52000,
  accent: "#bf6a2d",
  size: "750ml",
}

const wine = {
  id: "vino-casillero-cabernet-750",
  name: "Casillero del Diablo Cabernet",
  price: 58000,
  accent: "#721e30",
  size: "750ml",
}

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  it("adds new items with quantity one by default", () => {
    useCartStore.getState().addItem(bottle)

    expect(useCartStore.getState().items).toEqual([{ ...bottle, qty: 1 }])
  })

  it("accumulates quantity when adding an existing product", () => {
    useCartStore.getState().addItem(bottle, 2)
    useCartStore.getState().addItem(bottle, 3)

    expect(useCartStore.getState().items).toEqual([{ ...bottle, qty: 5 }])
  })

  it("removes items when their quantity is set to zero", () => {
    useCartStore.getState().addItem(bottle, 2)
    useCartStore.getState().setQty(bottle.id, 0)

    expect(useCartStore.getState().items).toEqual([])
  })

  it("calculates subtotal and item count", () => {
    useCartStore.getState().addItem(bottle, 2)
    useCartStore.getState().addItem(wine)

    expect(useCartStore.getState().subtotal()).toBe(162000)
    expect(useCartStore.getState().count()).toBe(3)
  })

  it("clears all cart items", () => {
    useCartStore.getState().addItem(bottle)
    useCartStore.getState().clear()

    expect(useCartStore.getState().items).toEqual([])
  })
})
