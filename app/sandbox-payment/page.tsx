"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { API_URL } from "@/lib/api-url"

function SandboxPaymentForm() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [status, setStatus] = useState<"approved" | "rejected" | "pending" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  async function completePayment(nextStatus: "approved" | "rejected" | "pending") {
    if (!orderId) {
      setMessage("Falta el identificador de la orden")
      return
    }

    setIsSubmitting(true)
    setMessage("")
    try {
      const response = await fetch(`${API_URL}/api/payments/sandbox/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error ?? "No se pudo simular el pago")
      setStatus(nextStatus)
      setMessage(`Orden ${result.data.id} actualizada correctamente.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo simular el pago")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-[2rem] border border-[#183c2c]/15 bg-white p-8 text-center md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f1d2a]">Sandbox interno</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Simular resultado de pago</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/60">
          Esta pantalla reemplaza temporalmente Checkout Pro mientras Mercado Pago habilita tus credenciales de prueba.
        </p>
        <p className="mt-5 rounded-xl bg-[#f8f5ef] px-4 py-3 font-mono text-xs text-black/60">
          Orden: {orderId ?? "no encontrada"}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            disabled={isSubmitting || !orderId}
            onClick={() => void completePayment("approved")}
            className="rounded-full bg-[#183c2c] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aprobar
          </button>
          <button
            type="button"
            disabled={isSubmitting || !orderId}
            onClick={() => void completePayment("pending")}
            className="rounded-full bg-[#d7a63e] px-4 py-3 text-sm font-bold text-[#1d211c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pendiente
          </button>
          <button
            type="button"
            disabled={isSubmitting || !orderId}
            onClick={() => void completePayment("rejected")}
            className="rounded-full bg-[#6f1d2a] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
        {status && <p className="mt-6 text-sm font-bold">Resultado simulado: {status}</p>}
        {message && <p className="mt-3 text-sm text-black/60">{message}</p>}
        <p className="mt-8 text-xs text-black/45">No se realiza ningún cobro real.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-bold text-[#183c2c]">Volver al catálogo</Link>
      </section>
    </main>
  )
}

export default function SandboxPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#f8f5ef]" />}>
      <SandboxPaymentForm />
    </Suspense>
  )
}
