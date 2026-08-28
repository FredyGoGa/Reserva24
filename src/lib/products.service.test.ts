import { describe, expect, it } from "vitest"
import { getProductById, getProducts } from "./products.service"

describe("products service", () => {
  it("returns a list of products from the source of truth", async () => {
    const products = await getProducts()

    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
    expect(products[0]).toHaveProperty("id")
  })

  it("returns a product by id when it exists", async () => {
    const product = await getProductById("aguardiente-antioqueno-750")

    expect(product).toBeDefined()
    expect(product?.name).toContain("Aguardiente")
  })

  it("returns undefined for a non-existent product", async () => {
    const product = await getProductById("no-existe")

    expect(product).toBeUndefined()
  })
})
