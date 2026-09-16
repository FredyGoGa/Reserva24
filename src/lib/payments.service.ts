import { createHmac, timingSafeEqual } from "node:crypto"
import { prisma } from "@/lib/prisma"

const mercadoPagoApiUrl = process.env.MERCADO_PAGO_API_URL ?? "https://api.mercadopago.com"

export type PaymentMode = "sandbox" | "mercado_pago"

export function paymentMode(): PaymentMode {
  return process.env.PAYMENT_MODE === "mercado_pago" ? "mercado_pago" : "sandbox"
}

type MercadoPagoPreference = {
  id: string
  init_point?: string
  sandbox_init_point?: string
}

type MercadoPagoPayment = {
  id: number
  status: "approved" | "pending" | "rejected" | "cancelled" | string
  transaction_amount: number
  currency_id: string
  external_reference?: string
}

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) throw new Error("Mercado Pago no está configurado")
  return token
}

function frontendUrl(path: string) {
  return `${(process.env.FRONTEND_PUBLIC_URL ?? process.env.FRONTEND_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "")}${path}`
}

function publicFrontendUrl() {
  const origin = process.env.FRONTEND_PUBLIC_URL
  return origin?.startsWith("https://") ? origin.replace(/\/$/, "") : undefined
}

async function mercadoPagoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${mercadoPagoApiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const details = await response.text()
    let message = `Mercado Pago respondió ${response.status}`
    try {
      const payload = JSON.parse(details) as { message?: string; error?: string }
      message = `${message}: ${payload.message ?? payload.error ?? "Solicitud rechazada"}`
    } catch {
      if (details && process.env.NODE_ENV !== "production") message = `${message}: ${details.slice(0, 240)}`
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function createCheckoutPreference(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  })
  if (!order) return undefined
  if (order.status !== "PENDING_PAYMENT") throw new Error("La orden no está pendiente de pago")

  const payment = order.payments[0]
  if (!payment || payment.provider !== "MERCADO_PAGO") throw new Error("La orden no tiene un pago válido")

  if (paymentMode() === "sandbox") {
    const preference = { id: `sandbox-${payment.id}`, external_reference: order.id, status: "sandbox" }
    await prisma.payment.update({
      where: { id: payment.id },
      data: { preferenceId: preference.id, rawResponse: preference },
    })
    return { preferenceId: preference.id, initPoint: frontendUrl(`/sandbox-payment?orderId=${encodeURIComponent(order.id)}`) }
  }

  if (payment.preferenceId) {
    const storedPreference = payment.rawResponse as MercadoPagoPreference | null
    return {
      preferenceId: payment.preferenceId,
      initPoint: storedPreference?.init_point ?? storedPreference?.sandbox_init_point,
    }
  }

  const notificationUrl = process.env.BACKEND_PUBLIC_URL
    ? `${process.env.BACKEND_PUBLIC_URL.replace(/\/$/, "")}/api/payments/webhook`
    : undefined
  if (!notificationUrl && process.env.NODE_ENV === "production") {
    throw new Error("BACKEND_PUBLIC_URL es requerido en producción")
  }

  const preference = await mercadoPagoRequest<MercadoPagoPreference>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.name,
        quantity: item.qty,
        unit_price: item.unitPrice,
        currency_id: "COP",
      })),
      payer: { email: order.email, name: order.customerName },
      external_reference: order.id,
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      ...(publicFrontendUrl()
        ? {
            back_urls: {
              success: frontendUrl("/success"),
              pending: frontendUrl("/pending"),
              failure: frontendUrl("/failure"),
            },
            auto_return: "approved",
          }
        : {}),
    }),
  })

  await prisma.payment.update({
    where: { id: payment.id },
    data: { preferenceId: preference.id, rawResponse: preference },
  })

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point ?? preference.sandbox_init_point,
  }
}

export async function completeSandboxPayment(orderId: string, status: "approved" | "rejected" | "pending") {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: { where: { provider: "MERCADO_PAGO" }, orderBy: { createdAt: "desc" }, take: 1 } },
  })
  if (!order) return undefined

  const payment = order.payments[0]
  if (!payment) throw new Error("Pago interno no encontrado")

  return applyPaymentResult({
    id: payment.providerPaymentId ? Number(payment.providerPaymentId.replace("sandbox-", "")) : Date.now(),
    status,
    transaction_amount: payment.amount,
    currency_id: payment.currency,
    external_reference: order.id,
  })
}

function parseSignature(value: string | undefined) {
  const fields = new Map<string, string>()
  for (const part of value?.split(",") ?? []) {
    const [key, fieldValue] = part.trim().split("=", 2)
    if (key && fieldValue) fields.set(key, fieldValue)
  }
  return { timestamp: fields.get("ts"), signature: fields.get("v1") }
}

export function verifyMercadoPagoSignature(signatureHeader: string | undefined, requestId: string | undefined, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret || !requestId) return false
  const { timestamp, signature } = parseSignature(signatureHeader)
  if (!timestamp || !signature) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`
  const expected = createHmac("sha256", secret).update(manifest).digest("hex")
  const received = Buffer.from(signature, "hex")
  const calculated = Buffer.from(expected, "hex")
  return received.length === calculated.length && timingSafeEqual(received, calculated)
}

export async function synchronizeMercadoPagoPayment(paymentId: string) {
  const remotePayment = await mercadoPagoRequest<MercadoPagoPayment>(`/v1/payments/${encodeURIComponent(paymentId)}`)
  return applyPaymentResult(remotePayment)
}

async function applyPaymentResult(remotePayment: MercadoPagoPayment) {
  const orderId = remotePayment.external_reference
  if (!orderId) throw new Error("El pago no tiene una orden asociada")

  return prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: { where: { provider: "MERCADO_PAGO" }, orderBy: { createdAt: "desc" }, take: 1 } },
    })
    if (!order) throw new Error("Orden no encontrada")

    const payment = order.payments[0]
    if (!payment) throw new Error("Pago interno no encontrado")
    if (payment.providerPaymentId === String(remotePayment.id) && payment.status === remotePayment.status.toUpperCase()) {
      return order
    }

    const status = remotePayment.status === "approved"
      ? "APPROVED"
      : remotePayment.status === "rejected"
        ? "REJECTED"
        : remotePayment.status === "cancelled"
          ? "CANCELLED"
          : "PENDING"

    if (remotePayment.transaction_amount !== payment.amount || remotePayment.currency_id !== payment.currency) {
      throw new Error("El importe o moneda del pago no coincide")
    }

    await transaction.payment.update({
      where: { id: payment.id },
      data: { providerPaymentId: String(remotePayment.id), status, rawResponse: remotePayment },
    })

    if (status === "APPROVED" && order.status === "PENDING_PAYMENT") {
      await transaction.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } })
    }

    if (status === "CANCELLED" && order.status === "PENDING_PAYMENT") {
      for (const item of order.items) {
        await transaction.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } })
      }
      await transaction.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } })
    }

    return order
  })
}
