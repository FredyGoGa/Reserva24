"use client"

import { useState } from "react"
import type { Product } from "@/lib/products.mock"
import { formatCOP } from "@/lib/pricing"
import { useCartStore } from "@/lib/cart.store"
import ProductVisual from "./ProductVisual"

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      accent: product.accent,
      size: product.size,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="group relative rounded-[1.65rem] border border-black/10 bg-white p-3 shadow-[0_18px_45px_rgba(42,35,25,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(42,35,25,0.14)]">
      {product.featured && (
        <span className="absolute left-6 top-6 z-10 rounded-full bg-[#f3efe5]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#762b36] backdrop-blur-sm">
          Favorito
        </span>
      )}
      <ProductVisual name={product.name} accent={product.accent} />
      <div className="px-2 pb-3 pt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#6f1d2a]">
          <span>{product.category}</span>
          <span className="text-black/45">{product.size}</span>
        </div>
        <h3 className="min-h-14 font-display text-xl font-bold leading-tight">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-black/55">
          {product.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl font-bold">{formatCOP(product.price)}</p>
            {product.oldPrice && (
              <p className="text-xs text-black/40 line-through">
                {formatCOP(product.oldPrice)}
              </p>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="rounded-full bg-[#174737] px-4 py-2.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#762b36]"
          >
            {added ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  )
}
