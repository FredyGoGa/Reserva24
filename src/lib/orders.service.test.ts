import { describe, expect, it } from "vitest"
import { createOrder } from "./orders.service"

describe("orders service", () => {
  it("creates an order with a calculated total", () => {
    const order = createOrder({
      customerName: "Ana Pérez",
      document: "1000000000",
      phone: "3001234567",
      email: "ana@example.com",
      address: "Calle 10 # 20-30",
      items: [
        { id: "p1", name: "Producto 1", qty: 2, price: 10000 },
        { id: "p2", name: "Producto 2", qty: 1, price: 5000 },
      ],
    })

    expect(order.status).toBe("pending")
    expect(order.total).toBe(25000)
    expect(order.items).toHaveLength(2)
  })
})
