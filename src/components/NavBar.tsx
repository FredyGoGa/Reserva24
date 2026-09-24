"use client"

import Link from "next/link"
import { useCartStore } from "@/lib/cart.store"
import { useHydrated } from "@/lib/use-hydrated"

export default function NavBar() {
  const count = useCartStore((s) => s.count())
  const mounted = useHydrated()

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f3efe5]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[1.1rem] bg-[#174737] font-display text-lg font-bold text-[#f1c35d] shadow-[0_8px_20px_rgba(23,71,55,.18)]">
            24
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-[#18231d]">
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
          <span className="rounded-full border border-[#174737]/15 bg-[#174737]/5 px-3 py-1.5 text-[#174737]">
            ● Entregas en Facatativá
          </span>
        </nav>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 rounded-full bg-[#18231d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(24,35,29,.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#762b36]"
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
