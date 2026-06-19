import { describe, expect, it } from "vitest"
import { products } from "./products.mock"

describe("products catalog", () => {
  it("keeps product ids unique", () => {
    const ids = products.map((product) => product.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it("contains sellable products with required storefront fields", () => {
    expect(products.length).toBeGreaterThan(0)

    for (const product of products) {
      expect(product.name).toBeTruthy()
      expect(product.price).toBeGreaterThan(0)
      expect(product.category).toBeTruthy()
      expect(product.brand).toBeTruthy()
      expect(product.size).toBeTruthy()
      expect(product.accent).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
