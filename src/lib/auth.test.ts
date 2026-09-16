import { afterEach, describe, expect, it, vi } from "vitest"
import { createSessionToken, verifySessionToken } from "./auth"

afterEach(() => vi.useRealTimers())

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

  it("rejects an expired session token", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
    const token = createSessionToken({ sub: "user-123", email: "admin@reserva24.local", role: "ADMIN" })

    vi.setSystemTime(new Date("2026-02-01T00:00:00.000Z"))
    expect(verifySessionToken(token)).toBeNull()
  })
})
