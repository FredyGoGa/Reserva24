import { describe, expect, it } from "vitest"
import { POST } from "./route"

describe("POST /api/order", () => {
  it("accepts the same payload as /api/orders", async () => {
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
  })
})
