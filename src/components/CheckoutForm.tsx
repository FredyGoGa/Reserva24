"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { useCartStore } from "@/lib/cart.store"
import { formatCOP } from "@/lib/pricing"
import { useHydrated } from "@/lib/use-hydrated"

export default function CheckoutForm() {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal())
  const mounted = useHydrated()
  const [message, setMessage] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(
      "El formulario está listo. El siguiente paso será conectarlo con Mercado Pago."
    )
  }

  if (!mounted) {
    return <div className="min-h-96 animate-pulse rounded-[2rem] bg-black/5" />
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
        <button className="w-full rounded-full bg-[#d7a63e] px-5 py-3.5 text-sm font-bold text-[#1d211c] transition hover:bg-[#f1c35d]">
          Pagar con Mercado Pago
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
