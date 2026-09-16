import { afterEach, describe, expect, it, vi } from "vitest"
import { createHmac } from "node:crypto"
import { verifyMercadoPagoSignature } from "./payments.service"

describe("Mercado Pago webhook security", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("accepts a valid x-signature manifest", () => {
    vi.stubEnv("MERCADO_PAGO_WEBHOOK_SECRET", "webhook-secret")
    const requestId = "request-123"
    const dataId = "payment-456"
    const timestamp = "1710000000"
    const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`
    const signature = createHmac("sha256", "webhook-secret").update(manifest).digest("hex")

    expect(verifyMercadoPagoSignature(`ts=${timestamp},v1=${signature}`, requestId, dataId)).toBe(true)
  })

  it("rejects a modified signature", () => {
    vi.stubEnv("MERCADO_PAGO_WEBHOOK_SECRET", "webhook-secret")

    expect(verifyMercadoPagoSignature("ts=1710000000,v1=invalid", "request-123", "payment-456")).toBe(false)
  })
})