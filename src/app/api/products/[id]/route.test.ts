import { describe, expect, it } from "vitest"
import { GET } from "./route"

describe("GET /api/products/[id]", () => {
  it("returns the product when it exists", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "aguardiente-antioqueno-750" }),
    })

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.id).toBe("aguardiente-antioqueno-750")
  })

  it("returns 404 when the product does not exist", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "producto-inexistente" }),
    })

    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.success).toBe(false)
  })
})
