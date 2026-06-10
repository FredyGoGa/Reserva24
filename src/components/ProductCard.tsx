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
    <article className="group rounded-[2rem] border border-black/10 bg-white p-3 shadow-[0_18px_45px_rgba(42,35,25,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(42,35,25,0.12)]">
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
            className="rounded-full bg-[#183c2c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#6f1d2a]"
          >
            {added ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  )
}
