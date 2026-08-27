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
        {
          id: "aguardiente-antioqueno-750",
          name: "Aguardiente Antioqueño",
          qty: 2,
          price: 45000,
        },
        {
          id: "ron-medellin-anejo-750",
          name: "Ron Medellín Añejo",
          qty: 1,
          price: 52000,
        },
      ],
    })

    expect(order.status).toBe("pending")
    expect(order.total).toBe(142000)
    expect(order.items).toHaveLength(2)
  })

  it("throws an error when one of the products does not exist", () => {
    expect(() =>
      createOrder({
        customerName: "Ana Pérez",
        document: "1000000000",
        phone: "3001234567",
        email: "ana@example.com",
        address: "Calle 10 # 20-30",
        items: [{ id: "producto-inexistente", name: "Producto inexistente", qty: 1, price: 10000 }],
      })
    ).toThrow("Producto no encontrado")
  })

  it("rejects invalid quantities and client prices", () => {
    expect(() =>
      createOrder({
        customerName: "Ana Pérez",
        document: "1000000000",
        phone: "3001234567",
        email: "ana@example.com",
        address: "Calle 10 # 20-30",
        items: [{ id: "aguardiente-antioqueno-750", name: "", qty: 0, price: 45000 }],
      })
    ).toThrow("Cantidad inválida")

    expect(() =>
      createOrder({
        customerName: "Ana Pérez",
        document: "1000000000",
        phone: "3001234567",
        email: "ana@example.com",
        address: "Calle 10 # 20-30",
        items: [{ id: "aguardiente-antioqueno-750", name: "", qty: 1, price: 1 }],
      })
    ).toThrow("Precio inválido")
  })
})
