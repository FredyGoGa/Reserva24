import { describe, expect, it } from "vitest"
import { createSessionToken, verifySessionToken } from "./auth"

describe("auth session helpers", () => {
  it("signs and verifies a valid session token", () => {
    const token = createSessionToken({
      sub: "user-123",
      email: "admin@reserva24.local",
      role: "ADMIN",
    })

    expect(verifySessionToken(token)).toMatchObject({
      sub: "user-123",
      email: "admin@reserva24.local",
      role: "ADMIN",
    })
  })

  it("rejects a malformed session token", () => {
    expect(verifySessionToken("token-muy-corto")).toBeNull()
  })
})
