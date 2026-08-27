import { describe, expect, it } from "vitest"
import { POST } from "./route"

describe("POST /api/orders", () => {
  it("creates an order when the payload is valid", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: "Ana Pérez",
          document: "1000000000",
          phone: "3001234567",
          email: "ana@example.com",
          address: "Calle 10 # 20-30",
          items: [{ id: "aguardiente-antioqueno-750", name: "Aguardiente Antioqueño", qty: 1, price: 45000 }],
        }),
      })
    )

    expect(response.status).toBe(201)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.status).toBe("pending")
  })

  it("returns 400 when the payload is incomplete", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: "Ana Pérez",
          items: [{ id: "aguardiente-antioqueno-750", name: "Aguardiente Antioqueño", qty: 1, price: 45000 }],
        }),
      })
    )

    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
  })

  it("returns 400 when one of the requested products does not exist", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: "Ana Pérez",
          document: "1000000000",
          phone: "3001234567",
          email: "ana@example.com",
          address: "Calle 10 # 20-30",
          items: [{ id: "producto-inexistente", name: "Producto inexistente", qty: 1, price: 10000 }],
        }),
      })
    )

    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe("Producto no encontrado")
  })
})
