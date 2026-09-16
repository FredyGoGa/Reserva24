"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { useCartStore } from "@/lib/cart.store"
import { formatCOP } from "@/lib/pricing"
import { useHydrated } from "@/lib/use-hydrated"
import { API_URL } from "@/lib/api-url"

type FormFields = {
  name: string
  document: string
  phone: string
  email: string
  address: string
  notes: string
}

export default function CheckoutForm() {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal())
  const clearCart = useCartStore((state) => state.clear)
  const [message, setMessage] = useState("")
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mounted = useHydrated()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setCreatedOrderId(null)

    const formData = new FormData(event.currentTarget)
    const payload: FormFields = {
      name: String(formData.get("name") ?? ""),
      document: String(formData.get("document") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      address: String(formData.get("address") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    }

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: payload.name,
          document: payload.document,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          notes: payload.notes,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "No se pudo crear el pedido")
      }

      const paymentResponse = await fetch(`${API_URL}/api/payments/preference`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: result.data.id }),
      })
      const paymentResult = await paymentResponse.json()
      if (!paymentResponse.ok || !paymentResult.success || !paymentResult.data.initPoint) {
        throw new Error(paymentResult.error ?? "No se pudo iniciar el pago")
      }

      clearCart()
      window.location.assign(paymentResult.data.initPoint)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear el pedido. Inténtalo de nuevo."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return <div className="min-h-72 animate-pulse rounded-[2rem] bg-black/5" />
  }

  if (createdOrderId) {
    return (
      <div className="rounded-[2rem] border border-[#183c2c]/15 bg-white p-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f1d2a]">
          Pedido recibido
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold">Gracias por tu compra</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/60">
          {message} Te contactaremos para coordinar la entrega.
        </p>
        <Link
          href="/#catalogo"
          className="mt-6 inline-block rounded-full bg-[#183c2c] px-6 py-3 text-sm font-bold text-white"
        >
          Volver al catálogo
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] bg-white p-10 text-center">
        <h2 className="font-display text-2xl font-bold">No hay productos para pagar</h2>
        <Link
          href="/#catalogo"
          className="mt-5 inline-block rounded-full bg-[#183c2c] px-6 py-3 text-sm font-bold text-white"
        >
          Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-[2rem] border border-black/10 bg-white p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold">Datos de entrega</h2>
        <p className="mt-2 text-sm text-black/50">
          Usaremos esta información únicamente para coordinar tu pedido.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field label="Nombre completo" name="name" />
          <Field label="Documento de identidad" name="document" />
          <Field label="Celular" name="phone" type="tel" />
          <Field label="Correo electrónico" name="email" type="email" />
          <div className="sm:col-span-2">
            <Field label="Dirección de entrega" name="address" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold">
              Notas para la entrega
              <textarea
                name="notes"
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-black/15 bg-[#f8f5ef] px-4 py-3 font-normal outline-none transition focus:border-[#183c2c]"
                placeholder="Apartamento, referencia o indicaciones adicionales"
              />
            </label>
          </div>
        </div>
        <label className="mt-6 flex items-start gap-3 text-sm leading-5 text-black/60">
          <input required type="checkbox" className="mt-1 accent-[#183c2c]" />
          Confirmo que soy mayor de 18 años y presentaré mi documento al recibir.
        </label>
      </div>

      <aside className="h-fit rounded-[2rem] bg-[#183c2c] p-6 text-white lg:sticky lg:top-24">
        <h2 className="font-display text-2xl font-bold">Tu pedido</h2>
        <div className="mt-5 space-y-3 border-b border-white/15 pb-5">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-white/65">
                {item.qty} × {item.name}
              </span>
              <span>{formatCOP(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between py-5 font-display text-xl font-bold">
          <span>Subtotal</span>
          <span>{formatCOP(subtotal)}</span>
        </div>
        <button
          disabled={isSubmitting}
          className="w-full rounded-full bg-[#d7a63e] px-5 py-3.5 text-sm font-bold text-[#1d211c] transition hover:bg-[#f1c35d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creando pedido..." : "Continuar al pago"}
        </button>
        {message && (
          <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/75">
            {message}
          </p>
        )}
      </aside>
    </form>
  )
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string
  name: string
  type?: string
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input
        required
        type={type}
        name={name}
        className="mt-2 w-full rounded-xl border border-black/15 bg-[#f8f5ef] px-4 py-3 font-normal outline-none transition focus:border-[#183c2c]"
      />
    </label>
  )
}
