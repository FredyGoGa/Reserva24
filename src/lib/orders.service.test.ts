import { describe, expect, it } from "vitest"
import { createOrder } from "./orders.service"

describe("orders service", () => {
  it("creates an order with a calculated total", async () => {
    const order = await createOrder({
      customerName: "Ana Pérez",
      document: "1000000000",
      phone: "3001234567",
      email: "ana@example.com",
      address: "Calle 10 # 20-30",
      items: [
        {
          id: "aguardiente-antioqueno-750",
          qty: 2,
        },
        {
          id: "ron-medellin-anejo-750",
          qty: 1,
        },
      ],
    })

    expect(order.status).toBe("pending_payment")
    expect(order.total).toBe(142000)
    expect(order.items).toHaveLength(2)
  })

  it("throws an error when one of the products does not exist", async () => {
    await expect(
      createOrder({
        customerName: "Ana Pérez",
        document: "1000000000",
        phone: "3001234567",
        email: "ana@example.com",
        address: "Calle 10 # 20-30",
        items: [{ id: "producto-inexistente", qty: 1 }],
      })
    ).rejects.toThrow("Producto no encontrado")
  })

  it("rejects invalid quantities and ignores client prices", async () => {
    await expect(
      createOrder({
        customerName: "Ana Pérez",
        document: "1000000000",
        phone: "3001234567",
        email: "ana@example.com",
        address: "Calle 10 # 20-30",
        items: [{ id: "aguardiente-antioqueno-750", qty: 0 }],
      })
    ).rejects.toThrow("Cantidad inválida")

    const order = await createOrder({
        customerName: "Ana Pérez",
        document: "1000000000",
        phone: "3001234567",
        email: "ana@example.com",
        address: "Calle 10 # 20-30",
        items: [{ id: "aguardiente-antioqueno-750", qty: 1, price: 1 } as never],
      })
    expect(order.total).toBe(45000)
  })
})
