import { describe, expect, it } from "vitest"
import { proxy } from "../proxy"

describe("Next API boundary", () => {
  it("does not expose legacy Next API routes", () => {
    const response = proxy()
    expect(response.status).toBe(404)
  })
})
