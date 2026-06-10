"use client"

import Link from "next/link"
import { useCartStore } from "@/lib/cart.store"
import { formatCOP } from "@/lib/pricing"
import { useHydrated } from "@/lib/use-hydrated"
import ProductVisual from "./ProductVisual"

export default function CartView() {
  const items = useCartStore((state) => state.items)
  const setQty = useCartStore((state) => state.setQty)
  const removeItem = useCartStore((state) => state.removeItem)
  const subtotal = useCartStore((state) => state.subtotal())
  const mounted = useHydrated()

  if (!mounted) {
    return <div className="min-h-72 animate-pulse rounded-[2rem] bg-black/5" />
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-black/10 bg-white px-6 py-20 text-center">
        <p className="font-display text-3xl font-bold">Tu carrito está vacío</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
          Parece que todavía no has elegido qué llevar. Tenemos varias buenas
          opciones esperando por ti.
        </p>
        <Link
          href="/#catalogo"
          className="mt-7 inline-block rounded-full bg-[#183c2c] px-6 py-3 text-sm font-bold text-white"
        >
          Explorar catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex gap-4 rounded-[1.5rem] border border-black/10 bg-white p-4 sm:items-center"
          >
            <ProductVisual name={item.name} accent={item.accent} compact />
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">{item.name}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40">
                  {item.size}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-3 text-xs font-bold text-[#6f1d2a] hover:underline"
                >
                  Eliminar
                </button>
              </div>
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center rounded-full border border-black/15">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="size-9 text-lg"
                    aria-label={`Disminuir cantidad de ${item.name}`}
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-sm font-bold">{item.qty}</span>
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="size-9 text-lg"
                    aria-label={`Aumentar cantidad de ${item.name}`}
                  >
                    +
                  </button>
                </div>
                <p className="min-w-24 text-right font-display text-lg font-bold">
                  {formatCOP(item.price * item.qty)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-[2rem] bg-[#183c2c] p-6 text-white lg:sticky lg:top-24">
        <h2 className="font-display text-2xl font-bold">Resumen</h2>
        <div className="mt-6 space-y-3 border-b border-white/15 pb-5 text-sm">
          <div className="flex justify-between text-white/65">
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-white/65">
            <span>Envío</span>
            <span>Se calcula al finalizar</span>
          </div>
        </div>
        <div className="flex justify-between py-5 font-display text-xl font-bold">
          <span>Total parcial</span>
          <span>{formatCOP(subtotal)}</span>
        </div>
        <Link
          href="/checkout"
          className="block rounded-full bg-[#d7a63e] px-5 py-3.5 text-center text-sm font-bold text-[#1d211c] transition hover:bg-[#f1c35d]"
        >
          Continuar compra
        </Link>
      </aside>
    </div>
  )
}
