import { describe, expect, it } from "vitest"
import { formatCOP } from "./pricing"

describe("formatCOP", () => {
  it("formats Colombian pesos without decimal digits", () => {
    expect(formatCOP(45000)).toBe("$ 45.000")
  })

  it("rounds decimal input to the nearest peso", () => {
    expect(formatCOP(1234.56)).toBe("$ 1.235")
  })
})
