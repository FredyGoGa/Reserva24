import { describe, expect, it } from "vitest"
import { GET } from "./route"

describe("GET /api/products", () => {
  it("returns the available products with a success payload", async () => {
    const response = await GET()

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toHaveProperty("id")
  })
})
