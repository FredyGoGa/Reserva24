"use client"

import { useState } from "react"
import ProductCard from "./ProductCard"
import { products } from "@/lib/products.mock"

const categories = ["Todos", ...new Set(products.map((product) => product.category))]

export default function Catalog() {
  const [category, setCategory] = useState("Todos")
  const visibleProducts =
    category === "Todos"
      ? products
      : products.filter((product) => product.category === category)

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6f1d2a]">
            Nuestra selección
          </p>
          <h2 className="max-w-xl font-display text-4xl font-bold leading-tight md:text-5xl">
            Una buena botella cambia la noche
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-black/55">
          Productos seleccionados, precios claros y entrega local. Elige tu
          favorito y nosotros nos encargamos del resto.
        </p>
      </div>

      <div className="my-10 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
              category === item
                ? "border-[#183c2c] bg-[#183c2c] text-white"
                : "border-black/15 bg-transparent hover:border-[#183c2c]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
