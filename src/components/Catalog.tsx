"use client"

import { useEffect, useMemo, useState } from "react"
import ProductCard from "./ProductCard"
import type { Product } from "@/lib/products.mock"
import { API_URL } from "@/lib/api-url"

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState("Todos")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products`)
        const payload = await response.json()
        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "No se pudieron cargar los productos")
        }
        setProducts(payload.data ?? [])
      } catch (error) {
        console.error("No se pudieron cargar los productos", error)
        setError(error instanceof Error ? error.message : "No se pudieron cargar los productos")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(
    () => ["Todos", ...new Set(products.map((product) => product.category))],
    [products]
  )

  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === "Todos" || product.category === category
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery = !normalizedQuery || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(normalizedQuery)
    return matchesCategory && matchesQuery
  })

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#762b36]">
            La selección de la casa
          </p>
          <h2 className="max-w-xl font-display text-4xl font-bold leading-tight md:text-5xl">
            Encuentra algo para recordar
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-black/55">
          Desde el brindis espontáneo hasta la celebración esperada. Filtra por
          categoría y descubre una botella que encaje con el momento.
        </p>
      </div>

      <div className="my-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="group flex h-12 max-w-md items-center gap-3 rounded-full border border-black/10 bg-white px-5 shadow-[0_10px_30px_rgba(24,35,29,.05)] transition focus-within:border-[#174737] focus-within:shadow-[0_12px_32px_rgba(23,71,55,.12)]">
          <span className="text-lg text-[#174737]" aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por nombre, marca o categoría"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
            aria-label="Buscar productos"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar catálogo">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
              category === item
                ? "border-[#183c2c] bg-[#183c2c] text-white"
                : "border-black/15 bg-white/30 hover:-translate-y-0.5 hover:border-[#174737]"
            }`}
          >
            {item}
          </button>
        ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center text-sm text-black/55">
          Cargando productos...
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-[#6f1d2a]/20 bg-white p-10 text-center text-sm text-[#6f1d2a]">
          {error}. Configura DATABASE_URL y ejecuta la migración y el seed.
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center text-sm text-black/55">
          No hay productos disponibles para esta categoría.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
