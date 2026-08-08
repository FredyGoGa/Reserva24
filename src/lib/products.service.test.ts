import { describe, expect, it } from "vitest"
import { getProductById, getProducts } from "./products.service"

describe("products service", () => {
  it("returns a list of products from the source of truth", () => {
    const products = getProducts()

    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
    expect(products[0]).toHaveProperty("id")
  })

  it("returns a product by id when it exists", () => {
    const product = getProductById("aguardiente-antioqueno-750")

    expect(product).toBeDefined()
    expect(product?.name).toContain("Aguardiente")
  })

  it("returns undefined for a non-existent product", () => {
    const product = getProductById("no-existe")

    expect(product).toBeUndefined()
  })
})
