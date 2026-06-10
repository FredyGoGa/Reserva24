"use client"

import Link from "next/link"
import { useCartStore } from "@/lib/cart.store"
import { useHydrated } from "@/lib/use-hydrated"

export default function NavBar() {
  const count = useCartStore((s) => s.count())
  const mounted = useHydrated()

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1e8]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#183c2c] font-display text-lg font-bold text-[#f1c35d]">
            24
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Bodega 24
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          <Link href="/#catalogo" className="transition hover:text-[#6f1d2a]">
            Catálogo
          </Link>
          <Link href="/#beneficios" className="transition hover:text-[#6f1d2a]">
            Cómo comprar
          </Link>
          <span className="rounded-full bg-[#183c2c]/10 px-3 py-1.5 text-[#183c2c]">
            Entregas en Facatativá
          </span>
        </nav>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 rounded-full bg-[#1d211c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6f1d2a]"
        >
          Carrito
          {mounted && count > 0 && (
            <span className="inline-flex min-w-5 justify-center rounded-full bg-[#d7a63e] px-1.5 py-0.5 text-xs text-[#1d211c]">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
